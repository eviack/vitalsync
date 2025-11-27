from pydantic import BaseModel, Field


class MedicalSummary(BaseModel):
    """Structured JSON output for a medical document."""
    document_date: str = Field(..., description="The main date of the report in YYYY-MM-DD format. If not found, set to 'Unknown'.")
    document_category: str = Field(..., description="The type of document. Enum: ['Lab Report', 'Prescription', 'Discharge Summary', 'Imaging', 'Bill', 'Other']")
    patient_name: str = Field(..., description="The full name of the patient. If not found, set to 'Unknown'.")
    doctor_or_lab_name: str = Field(..., description="The name of the attending doctor or the lab facility. If not found, set to 'Unknown'.")
    executive_summary: str = Field(..., description="A 2-sentence summary of the document's key findings or purpose.")
    key_entities: dict = Field(..., description="An object containing lists of key medical terms (e.g., medications, conditions, critical_flags).")
