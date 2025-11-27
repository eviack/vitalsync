// src/utils/appwrite.js
import { Client, Storage, Databases, ID, Query } from "appwrite";

console.log("Endpoint:", import.meta.env.VITE_APPWRITE_ENDPOINT);
console.log("Project:", import.meta.env.VITE_APPWRITE_PROJECT_ID);

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Use VITE_ prefix for React/Vite
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const storage = new Storage(client);
const databases = new Databases(client);

// IDs from env
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;


export async function uploadMedicalRecord(file, filename, apiResponse) {
  try {
    console.log("🚀 Starting Appwrite Upload...");

    // ---------------------------------------------------------
    // STEP 1: Upload File to Storage
    // ---------------------------------------------------------
    // The Web SDK accepts the native 'File' object directly.
    const fileId = ID.unique();

    // const fileUpload = await storage.createFile(
    //   BUCKET_ID,
    //   fileId,
    //   file
    // );

    const fileUpload = await storage.createFile({
      bucketId: BUCKET_ID,
      fileId: fileId,
      file: file,
      permissions: [], // optional
    });

    console.log("✅ File uploaded:", fileUpload);

    // ---------------------------------------------------------
    // STEP 2: Construct File View URL
    // ---------------------------------------------------------
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT.replace(
      /\/v1$/,
      ""
    );
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    const fileUrl = `${endpoint}/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;

    // ---------------------------------------------------------
    // STEP 3: Prepare Metadata from API Response
    // ---------------------------------------------------------
    // We map your FastAPI response fields to your Appwrite columns
    const now = new Date();

    // Extract extracted text if your API returns it, or use the summary
    // Assuming apiResponse follows the 'MedicalSummary' schema we defined earlier
    const metadataPayload = {
      fileId: fileId,
      date: apiResponse.document_date || now.toISOString().slice(0, 10),
      timestamp: now.toISOString(),
      file_url: fileUrl,
      // Mapping FastAPI 'executive_summary' to 'extracted_text' or 'sub_title'
      extracted_text: apiResponse.executive_summary || "No summary generated",
      title: apiResponse.document_category || "Unknown Document",
      name: filename,
      // Store the full structured analysis as a JSON string in meta_data
      meta_data: JSON.stringify(apiResponse.key_entities || {}),
    };

    // ---------------------------------------------------------
    // STEP 4: Create Database Row
    // ---------------------------------------------------------
    const row = await databases.createDocument(
      DATABASE_ID,
      TABLE_ID,
      fileId, // Using fileId as rowId for easy linking
      metadataPayload
    );

    console.log("✅ Database Entry Created:", row);
    return row;
  } catch (error) {
    console.error("❌ Appwrite Upload Error:", error);
    throw error;
  }
}

export async function getPatientDocuments() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            TABLE_ID,
            [Query.orderDesc('timestamp')] 
        );
        return response.documents.map(doc => ({
            ...doc,
            // We assign positions in the UI component to ensure grid layout
             defaultPosition: { x: 0, y: 0 }
        }));
    } catch (error) {
        console.error("Error fetching documents:", error);
        return [];
    }
}
