import cv2
import numpy as np
import pytesseract
from PIL import Image
import os
import io
import fitz 

def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from image using Tesseract OCR"""
    try:
        # Load and preprocess image
        image_np = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        processed = cv2.adaptiveThreshold(
            gray, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 
            11, 2
        )
        
        # Run OCR
        config = '--psm 6 --oem 3'
        text = pytesseract.image_to_string(processed, config=config)
        return text
        
    except Exception as e:
        print(f"OCR Error: {e}")
        # Fallback to PIL
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            return pytesseract.image_to_string(pil_image)
        except:
            return ""


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF (native or scanned)"""
    full_text = ""
    
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # CRITICAL FIX: Use 'sort=True' for correct table/column reading
            try:
                page_text = page.get_text("text", sort=True)
            except Exception as e:
                print(f"Warning: Sorted extraction failed on page {page_num}: {e}")
                page_text = page.get_text("text")  # Fallback without sorting
            
            # Check if page has meaningful text
            if len(page_text.strip()) < 50:
                # Appears scanned - use OCR
                print(f"Page {page_num + 1}: Running OCR (minimal native text)")
                pix = page.get_pixmap(dpi=300)
                img_bytes = pix.tobytes("png")
                ocr_text = extract_text_from_image(img_bytes)
                full_text += f"\n--- Page {page_num + 1} (OCR) ---\n{ocr_text}"
            else:
                # Native text extraction worked
                full_text += f"\n--- Page {page_num + 1} (Native) ---\n{page_text}"
        
        doc.close()
        return full_text
        
    except Exception as e:
        print(f"PDF Error: {e}")
        return ""


def process_document_bytes(file_bytes: bytes, file_name: str) -> str:
    """
    Internal router function to process a file based on its name (extension).
    """
    try:
        _, ext = os.path.splitext(file_name.lower())
        
        print(f"Processing file with extension: {ext}")
        
        if ext == ".pdf":
            return extract_text_from_pdf(file_bytes)
        elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            return extract_text_from_image(file_bytes)
        else:
            print(f"Unsupported file type: {ext}")
            return ""
            
    except Exception as e:
        print(f"Error processing document bytes: {e}")
        return ""
    


