import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def save_checkpoint(job_id: str, epoch: int, metrics: Dict[str, Any], output_dir: str = "./outputs"):
    """Saves a training checkpoint manifest."""
    checkpoint_dir = os.path.join(output_dir, job_id, "checkpoints")
    os.makedirs(checkpoint_dir, exist_ok=True)
    
    manifest_path = os.path.join(checkpoint_dir, "manifest.json")
    data = {
        "job_id": job_id,
        "current_epoch": epoch,
        "metrics": metrics,
    }
    
    with open(manifest_path, "w") as f:
        json.dump(data, f)
        
    logger.info(f"Checkpoint saved for job {job_id} at epoch {epoch}")

def load_checkpoint(job_id: str, output_dir: str = "./outputs") -> Optional[Dict[str, Any]]:
    """Loads a training checkpoint manifest if it exists."""
    manifest_path = os.path.join(output_dir, job_id, "checkpoints", "manifest.json")
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load checkpoint for {job_id}: {str(e)}")
            return None
    return None
