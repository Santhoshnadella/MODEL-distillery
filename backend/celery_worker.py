import os
import time
import json
from celery import Celery
import redis
try:
    from .distillation import DistillationTask
except ImportError:
    from distillation import DistillationTask

# Use the same REDIS_URL as FastAPI
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize Celery
celery_app = Celery(
    "distillery_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Sync Redis client for pub/sub progress updates
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

@celery_app.task(bind=True, name="run_distillation_job")
def run_distillation_job(self, job_id: int):
    """
    Executes a distillation or fine-tuning job using the Distillation Engine.
    """
    channel = f"job_progress_{job_id}"
    
    redis_client.publish(channel, f'{{"stage": "Initializing Worker", "progress": 5}}')
    
    try:
        try:
            from .app import SessionLocal, DistillationJob, Recipe, Dataset
        except ImportError:
            from app import SessionLocal, DistillationJob, Recipe, Dataset
        db = SessionLocal()
        job = db.query(DistillationJob).filter(DistillationJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
            
        recipe = db.query(Recipe).filter(Recipe.id == job.recipe_id).first()
        if not recipe:
             raise ValueError(f"Recipe {job.recipe_id} not found")
             
        dataset = db.query(Dataset).filter(Dataset.id == job.dataset_id).first()
        dataset_path = dataset.file_path if dataset else "backend/packs/proof_of_concept_5k.txt"
        
        # Build recipe dict
        recipe_dict = {
            "base_model": recipe.base_model,
            "method": recipe.method,
            "epochs": recipe.epochs,
            "batch_size": recipe.batch_size,
            "context_length": recipe.context_length
        }
        
        redis_client.publish(channel, f'{{"stage": "Starting Distillation Engine", "progress": 15}}')
        
        # Instantiate and run the engine
        task = DistillationTask(
            job_id=str(job.id),
            recipe=recipe_dict,
            dataset_path=dataset_path,
            output_dir="./backend/models"
        )
        
        # Execute the training
        output_dir = task.execute()
        
        # Update job status
        job.status = "Completed"
        job.progress = 100
        job.artifact_path = output_dir
        db.commit()
        
        redis_client.publish(channel, f'{{"stage": "Completed", "progress": 100, "status": "Completed"}}')
        return {"job_id": job_id, "status": "Completed", "progress": 100, "artifact_path": output_dir}

    except Exception as e:
        redis_client.publish(channel, f'{{"stage": "Failed: {str(e)}", "progress": 100, "status": "Failed"}}')
        
        try:
             db.rollback()
             if job:
                 job.status = "Failed"
                 db.commit()
        except:
             pass
             
        return {"job_id": job_id, "status": "Failed", "error": str(e)}
    finally:
        try:
            db.close()
        except:
            pass
