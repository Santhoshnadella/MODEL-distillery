import os
import logging

logger = logging.getLogger(__name__)

def export_to_gguf(job_id: str, output_dir: str = "./outputs") -> str:
    """Converts a trained model to GGUF format for local deployment."""
    logger.info(f"Exporting job {job_id} to GGUF format...")
    # Placeholder for llama.cpp conversion script
    export_path = os.path.join(output_dir, job_id, f"{job_id}.gguf")
    # Simulate work
    return export_path

def export_to_ollama(job_id: str, output_dir: str = "./outputs") -> str:
    """Creates an Ollama Modelfile for the trained model."""
    logger.info(f"Exporting job {job_id} for Ollama...")
    export_path = os.path.join(output_dir, job_id, "Modelfile")
    return export_path
