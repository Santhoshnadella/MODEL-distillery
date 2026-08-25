from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .exporters import export_to_gguf, export_to_ollama

router = APIRouter(prefix="/export", tags=["export"])

class ExportRequest(BaseModel):
    format: str

@router.post("/{job_id}")
def trigger_export(job_id: str, request: ExportRequest):
    """Triggers a background export task for the given model format."""
    format_type = request.format.lower()
    
    if format_type == "gguf":
        path = export_to_gguf(job_id)
        return {"status": "success", "message": f"Exported to GGUF at {path}"}
    elif format_type == "ollama":
        path = export_to_ollama(job_id)
        return {"status": "success", "message": f"Exported to Ollama at {path}"}
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format_type}")
