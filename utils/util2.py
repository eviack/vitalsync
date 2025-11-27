import fitz  # PyMuPDF
import pytesseract
import cv2
import numpy as np
from PIL import Image
import io
import os


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
            
            # CRITICAL FIX: Use 'sort=True' not 'sort_by_position=True'
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


def process_document(file_path: str) -> str:
    """Process any document (PDF or image)"""
    try:
        _, ext = os.path.splitext(file_path.lower())
        
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        
        print(f"Processing: {file_path}")
        
        if ext == ".pdf":
            return extract_text_from_pdf(file_bytes)
        elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            return extract_text_from_image(file_bytes)
        else:
            print(f"Unsupported file type: {ext}")
            return ""
            
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return ""
    except Exception as e:
        print(f"Error: {e}")
        return ""


if __name__ == "__main__":
    # Test with your PDF
    pdf_file = "test/A4sizeSD.png"
    
    
    if os.path.exists(pdf_file):
        print(f"\n{'='*80}")
        print(f"Testing: {pdf_file}")
        print('='*80)
        
        text = process_document(pdf_file)
        
        print(f"\nExtracted {len(text)} characters")
        print(f"\n{'='*80}")
        print("EXTRACTED TEXT:")
        print('='*80)
        print(text[:2000])  # Print first 2000 chars
        
    
    else:
        print(f"File not found: {pdf_file}")
