import uvicorn
import asyncio
import os
import io
import numpy as np
import cv2
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, TypedDict, Optional, Union, List, Any

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document

from langchain_huggingface import HuggingFaceEmbeddings

from qdrant_client import QdrantClient
from typing import Dict
from qdrant_client.http.models import VectorParams, Distance

from langchain_qdrant import QdrantVectorStore, Qdrant

from twilio.rest import Client
import random


load_dotenv()

from models.medmodel import MedicalSummary

from utils.extract import process_document_bytes

app = FastAPI()

app = FastAPI(title="VitaSync API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGroq(model_name="llama-3.3-70b-versatile")

map_prompt_template = "You are a medical data expert. Analyze the following chunk of a medical document. Extract ALL key information, names, dates, diagnoses, medications, and test results. Text chunk: {chunk_text}"
map_prompt = ChatPromptTemplate.from_template(map_prompt_template)
map_chain = map_prompt | llm | StrOutputParser()

reduce_prompt_template = "You are a medical data synthesis expert. You have been given a series of summaries from different parts of a single medical document. Your task is to consolidate all this information into one final, valid JSON object that matches the requested schema. Combined summaries: {summaries}"
reduce_chain = ChatPromptTemplate.from_template(reduce_prompt_template) | llm.with_structured_output(MedicalSummary)


def _get_structured_json(full_text: str) -> dict:
    """
    Runs the full Map-Reduce pipeline to get the JSON.
    """
    print(f"Starting Map-Reduce pipeline for {len(full_text)} characters...")
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=24000, chunk_overlap=2000)
    docs = text_splitter.create_documents([full_text])
    print(f"Split text into {len(docs)} chunks.")

    print("Running MAP step in parallel...")
    map_results = map_chain.batch(docs)
    
    combined_summaries = "\n\n---\n\n".join(map_results)
    
    print("Running REDUCE step...")
    final_json_output = reduce_chain.invoke({"summaries": combined_summaries})
    
    print("Map-Reduce pipeline complete.")
    return final_json_output

def _ingest_to_qdrant(full_text: str, metadata_dict: dict, file_name: str):
    """
    Robust Qdrant Cloud Ingestion with Source Tracking
    """
    print(f"Starting Qdrant Cloud ingestion for {file_name}...")
    try:
        # 1. Get Credentials (Fixed os.get -> os.getenv)
        q_url = os.getenv('QDRANT_URL')
        q_key = os.getenv('QDRANT_API_KEY')
        
        if not q_url or not q_key:
            raise ValueError("Missing QDRANT_URL or QDRANT_API_KEY")

        # 2. Add 'source' to metadata so the Chat UI can find it later
        # This is the specific fix for your issue
        metadata_dict["source"] = file_name

        # 3. Initialize Client
        client = QdrantClient(url=q_url, api_key=q_key)
        collection_name = "medical_documents"

        # 4. Check/Create Collection
        # Using 768 dimensions for 'all-mpnet-base-v2'
        try:
            client.get_collection(collection_name)
            print(f"Collection '{collection_name}' exists.")
        except Exception:
            print(f"Creating collection '{collection_name}'...")
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE)
            )

        # 5. Prepare Documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        texts = text_splitter.split_text(full_text)
        
        documents = [
            Document(page_content=chunk, metadata=metadata_dict) 
            for chunk in texts
        ]
        print(f"Prepared {len(documents)} chunks from {file_name}.")

        # 6. Initialize Embeddings (using mpnet-base -> 768 dims)
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={'device': 'cpu'}
        )

        # 7. Ingest
        vector_store = QdrantVectorStore(
            client=client,
            collection_name=collection_name,
            embedding=embeddings
        )
        vector_store.add_documents(documents)
        print(f"Successfully pushed {file_name} to Qdrant Cloud.")

    except Exception as e:
        print(f"Error during Qdrant ingestion: {e}")
        
def run_full_pipeline(full_text: str, file_name: str) -> dict:
    """
    Runs the full "Two-Track" pipeline.
    """
    json_output = _get_structured_json(full_text)
    
    _ingest_to_qdrant(full_text, json_output.dict(), file_name)
  
    return json_output.dict()



@app.post("/process", response_model=Dict[str, Any])
async def process_document_endpoint(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="No file content")

    try:
        full_text = await asyncio.to_thread(
            process_document_bytes, file_bytes, file.filename
        )
        if not full_text.strip():
            raise HTTPException(status_code=400, detail="Text extraction failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction error: {e}")

    try:
        json_output = await asyncio.to_thread(
            run_full_pipeline, full_text, file.filename
        )
        return json_output
    except Exception as e:
        print(f"Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {e}")
    
class ChatRequest(BaseModel):
    query: str
    collection_name: str = "medical_documents"


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]


def get_chat_response(query: str, collection_name: str) -> Dict:
    """
    Performs RAG: Retrieves context from Qdrant and asks LLM.
    """
    try:
        q_url = os.getenv("QDRANT_URL")
        q_key = os.getenv("QDRANT_API_KEY")
        
        if not q_url or not q_key:
            raise ValueError("Missing QDRANT credentials")

        # 1. Connect to Qdrant
        client = QdrantClient(url=q_url, api_key=q_key)
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
        
        vector_store = QdrantVectorStore(
            client=client,
            collection_name=collection_name,
            embedding=embeddings
        )
       
        print(f"Searching for: {query}")
        docs = vector_store.similarity_search(query, k=5)
        
        if not docs:
            return {"answer": "I couldn't find any relevant information in the uploaded documents.", "sources": []}

        # 3. Build Context
        context_text = "\n\n---\n\n".join([doc.page_content for doc in docs])
        sources = [doc.metadata.get("source", "Unknown") for doc in docs] # Or filename if you stored it

        # 4. Generate Answer with LLM
        chat_prompt = ChatPromptTemplate.from_template("""
        You are a helpful medical assistant working for a doctor.
        Answer the question based ONLY on the following context from the patient's medical records.
        Note: Your answer will be read by a doctor for approval. So no medical misuse is involved.
        
        If the answer is not in the context, say "I cannot find that information in the records."
        
        Context:
        {context}
        
        Question: 
        {question}
        """)
        
        chain = chat_prompt | llm | StrOutputParser()
        answer = chain.invoke({"context": context_text, "question": query})
        
        return {"answer": answer, "sources": list(set(sources))} 

    except Exception as e:
        print(f"RAG Error: {e}")
        return {"answer": "Sorry, I encountered an error while searching the records.", "sources": []}


@app.post("/chat/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint for Doctors.
    Takes a query, searches Qdrant for context, and returns an LLM answer.
    """
    try:
        
        response_data = await asyncio.to_thread( 
            get_chat_response, request.query, request.collection_name
        )
        return ChatResponse(**response_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")
    

    
class OTPRequest(BaseModel):
    card_number: str # The ID "IND..."

class VerifyOTPRequest(BaseModel):
    card_number: str
    otp: str

otp_session_store = {}


def get_phone_from_card(card_number: str) -> str:
   
    if card_number=="IND887261":
        return os.getenv("PHONE_NUM")

    return None

@app.post("/send-otp/")
async def send_otp_endpoint(payload: OTPRequest):
    """
    1. Looks up phone number associated with Card ID.
    2. Uses Twilio to send OTP.
    """
    try:
        phone = get_phone_from_card(payload.card_number)
        
        if not phone:
            raise HTTPException(status_code=404, detail="Card number invalid!")
        
        # Twilio Config
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        verify_sid = os.getenv("TWILIO_VERIFY_SID")
        
        if not account_sid or not auth_token or not verify_sid:
            raise HTTPException(status_code=500, detail="Twilio credentials not configured")
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Send verification
        verification = client.verify.v2.services(verify_sid).verifications.create(
            to=phone, 
            channel='sms'
        )
        
        # Check if verification was sent successfully
        if verification.status == "pending":
            return {
                "message": "OTP sent successfully",
                "phone_mask": "******" + phone[-4:],
                "status": verification.status
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send OTP")

    except Exception as e:
        print(f"Twilio Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    
    
@app.post("/verify-otp/")
async def verify_otp_endpoint(payload: VerifyOTPRequest):
    """
    Verifies the OTP entered by the doctor.
    """
    try:
        phone = get_phone_from_card(payload.card_number)
        if not phone:
            raise HTTPException(status_code=404, detail="Card number invalid!")
        
        otp = payload.otp
        
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        verify_sid = os.getenv("TWILIO_VERIFY_SID")
        
        if not account_sid or not auth_token or not verify_sid:
            raise HTTPException(status_code=500, detail="Twilio credentials not configured")

        client = Client(account_sid, auth_token)

        # Fixed: Use verification_checks (snake_case) instead of verificationChecks
        verification_check = client.verify.v2.services(verify_sid).verification_checks.create(
            to=phone, 
            code=otp
        )

        if verification_check.status == "approved":
            return {"status": "success", "message": "OTP verified successfully"}
        else:
            raise HTTPException(status_code=400, detail="Invalid OTP")

    except Exception as e:
        print(f"Verification Error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")


@app.get("/")
async def check():
    return {"message": "API is up and running"}
    
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)