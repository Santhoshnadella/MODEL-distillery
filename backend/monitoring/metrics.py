import os
import time
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
import logging

logger = logging.getLogger(__name__)

# Define Metrics
DISTILLATION_JOBS_STARTED = Counter(
    "distillation_jobs_started_total", "Total number of distillation jobs started"
)
DISTILLATION_JOBS_COMPLETED = Counter(
    "distillation_jobs_completed_total", "Total number of distillation jobs completed successfully"
)
DISTILLATION_JOBS_FAILED = Counter(
    "distillation_jobs_failed_total", "Total number of distillation jobs failed"
)
DISTILLATION_JOB_DURATION = Histogram(
    "distillation_job_duration_seconds", "Duration of distillation jobs in seconds"
)

# Optional Middleware for generic HTTP tracking
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    return response

def get_metrics():
    """Returns prometheus metrics format for the /metrics endpoint"""
    return generate_latest(), CONTENT_TYPE_LATEST
