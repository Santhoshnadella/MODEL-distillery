from typing import Optional
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import os
import hashlib
import uuid
import secrets

import asyncio
import jwt
import httpx
import shutil
import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, Depends, Header, Request, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, String, Integer, Float, DateTime, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./distillery.db")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HUGGINGFACE_API_URL = os.getenv("HUGGINGFACE_API_URL", "https://api-inference.huggingface.co")
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Setup uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Redis client
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Import Celery tasks
from celery_worker import run_distillation_job

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


# Models
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String(100), primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(200), default="")
    organization: Mapped[str] = mapped_column(String(200), default="Northstar Labs")
    workspace: Mapped[str] = mapped_column(String(100), default="Amber Forge")
    role: Mapped[str] = mapped_column(String(50), default="Operator")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    base_model: Mapped[str] = mapped_column(String(100), default="")
    flavor_profile: Mapped[str] = mapped_column(String(100), default="")
    knowledge_blend: Mapped[int] = mapped_column(Integer, default=0)
    reasoning_style: Mapped[int] = mapped_column(Integer, default=0)
    tool_use: Mapped[int] = mapped_column(Integer, default=0)
    context_length: Mapped[int] = mapped_column(Integer, default=128)
    safety: Mapped[int] = mapped_column(Integer, default=0)
    hardware_budget: Mapped[int] = mapped_column(Integer, default=1)
    deployment_target: Mapped[str] = mapped_column(String(100), default="")
    version: Mapped[int] = mapped_column(Integer, default=1)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0.0)
    user_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    workspace: Mapped[str] = mapped_column(String(100), default="Amber Forge", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class ModelArtifact(Base):
    __tablename__ = "model_artifacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    version: Mapped[str] = mapped_column(String(50), default="1.0")
    family: Mapped[str] = mapped_column(String(100), default="")
    downloads: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="")
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    quality: Mapped[str] = mapped_column(String(20), default="A")


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    source: Mapped[str] = mapped_column(String(100), default="")
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    quality: Mapped[str] = mapped_column(String(20), default="A")
    user_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    workspace: Mapped[str] = mapped_column(String(100), default="Amber Forge", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DistillationJob(Base):
    __tablename__ = "distillation_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    objective: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Queued")
    stage: Mapped[str] = mapped_column(String(100), default="Queued")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    owner: Mapped[str] = mapped_column(String(100), default="Team")
    eta: Mapped[str] = mapped_column(String(50), default="TBD")
    gpu_hours: Mapped[float] = mapped_column(Float, default=0.0)
    user_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    workspace: Mapped[str] = mapped_column(String(100), default="Amber Forge", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    benchmark: Mapped[str] = mapped_column(String(100), default="")
    score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(100), index=True)
    action: Mapped[str] = mapped_column(String(50))
    resource: Mapped[str] = mapped_column(String(100))
    details: Mapped[str] = mapped_column(Text, default="")
    ip_address: Mapped[str] = mapped_column(String(50), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Membership(Base):
    __tablename__ = "memberships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(100), index=True)
    org_id: Mapped[int] = mapped_column(Integer, index=True)
    role: Mapped[str] = mapped_column(String(50), default="Member")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(100), index=True)
    key_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), default="Default Key")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)


# Utility functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "workspace": "Amber Forge",
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    return verify_token(token)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    # Seed sample data
    with Session(engine) as session:
        if session.query(ModelArtifact).count() == 0:
            sample_models = [
                ModelArtifact(name="Qwen 2.5 14B", family="Qwen", downloads=1240),
                ModelArtifact(name="Llama 2 13B", family="Llama", downloads=5670),
                ModelArtifact(name="Mistral 7B", family="Mistral", downloads=3450),
            ]
            session.add_all(sample_models)
            session.commit()
        
        if session.query(KnowledgeSource).count() == 0:
            sample_knowledge = [
                KnowledgeSource(name="Programming Knowledge", domain="Programming", token_count=250000, quality="A"),
                KnowledgeSource(name="Scientific Papers", domain="Science", token_count=180000, quality="A"),
                KnowledgeSource(name="Medical Textbooks", domain="Medical", token_count=150000, quality="B"),
                KnowledgeSource(name="Legal Database", domain="Legal", token_count=320000, quality="A"),
            ]
            session.add_all(sample_knowledge)
            session.commit()
    
    yield


app = FastAPI(title="Model Distillery API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    key = f"rate_limit:{client_ip}"
    
    try:
        # Allow 100 requests per minute
        requests = await redis_client.incr(key)
        if requests == 1:
            await redis_client.expire(key, 60)
        
        if requests > 100:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."}
            )
    except Exception:
        # If redis is down, bypass rate limiting
        pass
        
    response = await call_next(request)
    return response


@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    # Only log mutating actions
    if request.method in ["POST", "PUT", "DELETE", "PATCH"] and not request.url.path.startswith("/auth"):
        client_ip = request.client.host if request.client else "127.0.0.1"
        
        # We need the user ID. But since request body might be consumed, 
        # middleware is tricky. We'll extract token from header.
        user_id = "unknown"
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                user_id = payload.get("sub", "unknown")
            except Exception:
                pass
                
        response = await call_next(request)
        
        # Log it asynchronously to avoid blocking
        try:
            with Session(engine) as session:
                log = AuditLog(
                    user_id=user_id,
                    action=request.method,
                    resource=request.url.path,
                    details=f"Status: {response.status_code}",
                    ip_address=client_ip
                )
                session.add(log)
                session.commit()
        except Exception as e:
            print(f"Audit log failed: {e}")
            
        return response
        
    return await call_next(request)


# Authentication endpoints
@app.post("/auth/signup")
def signup(payload: dict) -> dict:
    email = payload.get("email", "").strip()
    password = payload.get("password", "").strip()
    name = payload.get("name", "Distiller").strip()
    organization = payload.get("organization", "Northstar Labs").strip()
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    with Session(engine) as session:
        if session.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="User already exists")
        
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=email,
            password_hash=hash_password(password),
            name=name,
            organization=organization,
            role="Owner",
        )
        session.add(user)
        session.commit()
        
        token = create_access_token(user_id, email, "Owner")
        return {
            "access_token": token,
            "user": {
                "id": user_id,
                "email": email,
                "name": name,
                "role": "Owner",
                "organization": organization,
                "workspace": "Amber Forge",
            },
        }


@app.post("/auth/login")
def login(payload: dict) -> dict:
    email = payload.get("email", "").strip()
    password = payload.get("password", "").strip()
    workspace = payload.get("workspace", "Amber Forge").strip()
    role = payload.get("role", "Operator").strip()
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    with Session(engine) as session:
        user = session.query(User).filter(User.email == email).first()
        
        if not user or user.password_hash != hash_password(password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = create_access_token(user.id, user.email, role)
        return {
            "access_token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": role,
                "organization": user.organization,
                "workspace": workspace,
            },
        }


# Health check
@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "model-distillery"}


# Overview
@app.get("/api/overview")
def overview(current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    
    with Session(engine) as session:
        return {
            "recipes": session.query(Recipe).filter(
                Recipe.user_id == user_id,
                Recipe.workspace == workspace
            ).count(),
            "models": session.query(ModelArtifact).count(),
            "knowledge_sources": session.query(KnowledgeSource).count(),
            "jobs": session.query(DistillationJob).filter(
                DistillationJob.user_id == user_id,
                DistillationJob.workspace == workspace
            ).count(),
        }


# Recipe endpoints
@app.post("/api/recipes")
def create_recipe(payload: dict, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    
    try:
        with Session(engine) as session:
            recipe = Recipe(
                name=str(payload.get("name", "Untitled Recipe")),
                description=str(payload.get("description", "")),
                base_model=str(payload.get("base_model", "")),
                flavor_profile=str(payload.get("flavor_profile", "")),
                knowledge_blend=int(payload.get("knowledge_blend", 0)),
                reasoning_style=int(payload.get("reasoning_style", 0)),
                tool_use=int(payload.get("tool_use", 0)),
                context_length=int(payload.get("context_length", 128)),
                safety=int(payload.get("safety", 0)),
                hardware_budget=int(payload.get("hardware_budget", 1)),
                deployment_target=str(payload.get("deployment_target", "")),
                version=int(payload.get("version", 1)),
                estimated_cost=float(payload.get("estimated_cost", 0.0)),
                user_id=user_id,
                workspace=workspace,
            )
            session.add(recipe)
            session.commit()
            session.refresh(recipe)
            
            return {
                "id": recipe.id,
                "name": recipe.name,
                "description": recipe.description,
                "base_model": recipe.base_model,
                "flavor_profile": recipe.flavor_profile,
                "knowledge_blend": recipe.knowledge_blend,
                "reasoning_style": recipe.reasoning_style,
                "tool_use": recipe.tool_use,
                "context_length": recipe.context_length,
                "safety": recipe.safety,
                "hardware_budget": recipe.hardware_budget,
                "deployment_target": recipe.deployment_target,
                "version": recipe.version,
                "estimated_cost": recipe.estimated_cost,
                "created_at": recipe.created_at.isoformat(),
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating recipe: {str(e)}")


@app.get("/api/recipes")
def list_recipes(
    skip: int = 0, 
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
) -> list:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    
    with Session(engine) as session:
        recipes = session.query(Recipe).filter(
            Recipe.user_id == user_id,
            Recipe.workspace == workspace
        ).offset(skip).limit(limit).all()
        
        return [
            {
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "base_model": r.base_model,
                "flavor_profile": r.flavor_profile,
                "knowledge_blend": r.knowledge_blend,
                "reasoning_style": r.reasoning_style,
                "tool_use": r.tool_use,
                "context_length": r.context_length,
                "safety": r.safety,
                "hardware_budget": r.hardware_budget,
                "deployment_target": r.deployment_target,
                "version": r.version,
                "estimated_cost": r.estimated_cost,
                "created_at": r.created_at.isoformat(),
            }
            for r in recipes
        ]


@app.get("/api/recipes/{recipe_id}")
def get_recipe(recipe_id: int, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    
    with Session(engine) as session:
        recipe = session.query(Recipe).filter(
            Recipe.id == recipe_id,
            Recipe.user_id == user_id
        ).first()
        
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        return {
            "id": recipe.id,
            "name": recipe.name,
            "description": recipe.description,
            "base_model": recipe.base_model,
            "flavor_profile": recipe.flavor_profile,
            "knowledge_blend": recipe.knowledge_blend,
            "reasoning_style": recipe.reasoning_style,
            "tool_use": recipe.tool_use,
            "context_length": recipe.context_length,
            "safety": recipe.safety,
            "hardware_budget": recipe.hardware_budget,
            "deployment_target": recipe.deployment_target,
            "version": recipe.version,
            "estimated_cost": recipe.estimated_cost,
            "created_at": recipe.created_at.isoformat(),
        }

@app.get("/api/recipes/{recipe_id}/export")
def export_recipe(recipe_id: int, current_user: dict = Depends(get_current_user)):
    recipe_dict = get_recipe(recipe_id, current_user)
    # Remove database-specific IDs for cleaner export
    recipe_dict.pop("id", None)
    
    headers = {
        'Content-Disposition': f'attachment; filename="recipe_{recipe_id}.json"'
    }
    return JSONResponse(content=recipe_dict, headers=headers)



@app.put("/api/recipes/{recipe_id}")
def update_recipe(recipe_id: int, payload: dict, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    
    try:
        with Session(engine) as session:
            recipe = session.query(Recipe).filter(
                Recipe.id == recipe_id,
                Recipe.user_id == user_id
            ).first()
            
            if not recipe:
                raise HTTPException(status_code=404, detail="Recipe not found")
            
            # Update all fields
            for field in ["name", "description", "base_model", "flavor_profile", "deployment_target"]:
                if field in payload:
                    setattr(recipe, field, str(payload[field]))
            
            for field in ["knowledge_blend", "reasoning_style", "tool_use", "context_length", "safety", "hardware_budget", "version"]:
                if field in payload:
                    setattr(recipe, field, int(payload[field]))
            
            if "estimated_cost" in payload:
                recipe.estimated_cost = float(payload["estimated_cost"])
            
            session.commit()
            session.refresh(recipe)
            
            return {
                "id": recipe.id,
                "name": recipe.name,
                "description": recipe.description,
                "base_model": recipe.base_model,
                "flavor_profile": recipe.flavor_profile,
                "knowledge_blend": recipe.knowledge_blend,
                "reasoning_style": recipe.reasoning_style,
                "tool_use": recipe.tool_use,
                "context_length": recipe.context_length,
                "safety": recipe.safety,
                "hardware_budget": recipe.hardware_budget,
                "deployment_target": recipe.deployment_target,
                "version": recipe.version,
                "estimated_cost": recipe.estimated_cost,
                "created_at": recipe.created_at.isoformat(),
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating recipe: {str(e)}")


@app.delete("/api/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    
    with Session(engine) as session:
        recipe = session.query(Recipe).filter(
            Recipe.id == recipe_id,
            Recipe.user_id == user_id
        ).first()
        
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        session.delete(recipe)
        session.commit()
        
        return {"message": "Recipe deleted"}


# Model endpoints
@app.get("/api/models")
def list_models() -> list:
    with Session(engine) as session:
        models = session.query(ModelArtifact).all()
        return [
            {
                "id": m.id,
                "name": m.name,
                "version": m.version,
                "family": m.family,
                "downloads": m.downloads,
            }
            for m in models
        ]


# Knowledge endpoints
@app.get("/api/knowledge")
def list_knowledge() -> list:
    with Session(engine) as session:
        sources = session.query(KnowledgeSource).all()
        return [
            {
                "id": s.id,
                "name": s.name,
                "domain": s.domain,
                "token_count": s.token_count,
                "quality": s.quality,
            }
            for s in sources
        ]


# Dataset endpoints
@app.post("/api/datasets/upload")
def upload_dataset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
) -> dict:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        with Session(engine) as session:
            dataset = Dataset(
                name=file.filename,
                description=f"Uploaded file: {file.filename}",
                source="local_upload",
                token_count=1000,
                quality="A",
                user_id=user_id,
                workspace=workspace,
            )
            session.add(dataset)
            session.commit()
            session.refresh(dataset)
            
            return {
                "id": dataset.id,
                "name": dataset.name,
                "description": dataset.description,
                "source": dataset.source,
                "token_count": dataset.token_count,
                "quality": dataset.quality,
                "created_at": dataset.created_at.isoformat(),
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error uploading dataset: {str(e)}")

@app.post("/api/datasets")
def create_dataset(payload: dict, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    
    try:
        with Session(engine) as session:
            dataset = Dataset(
                name=str(payload.get("name", "Untitled Dataset")),
                description=str(payload.get("description", "")),
                source=str(payload.get("source", "")),
                token_count=int(payload.get("token_count", 0)),
                quality=str(payload.get("quality", "A")),
                user_id=user_id,
                workspace=workspace,
            )
            session.add(dataset)
            session.commit()
            session.refresh(dataset)
            
            return {
                "id": dataset.id,
                "name": dataset.name,
                "description": dataset.description,
                "source": dataset.source,
                "token_count": dataset.token_count,
                "quality": dataset.quality,
                "created_at": dataset.created_at.isoformat(),
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating dataset: {str(e)}")


@app.get("/api/datasets")
def list_datasets(
    skip: int = 0, 
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
) -> list:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    
    with Session(engine) as session:
        datasets = session.query(Dataset).filter(
            Dataset.user_id == user_id,
            Dataset.workspace == workspace
        ).offset(skip).limit(limit).all()
        
        return [
            {
                "id": d.id,
                "name": d.name,
                "description": d.description,
                "source": d.source,
                "token_count": d.token_count,
                "quality": d.quality,
                "created_at": d.created_at.isoformat(),
            }
            for d in datasets
        ]


# Job endpoints
@app.post("/api/jobs")
def create_job(payload: dict, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    objective = str(payload.get("objective", "New workflow"))
    
    try:
        with Session(engine) as session:
            job = DistillationJob(
                name=f"Workflow: {objective[:32]}",
                objective=objective,
                status="Queued",
                stage="Queued",
                progress=0,
                owner="You",
                eta="Calculating...",
                gpu_hours=0.0,
                user_id=user_id,
                workspace=workspace,
            )
            session.add(job)
            session.commit()
            session.refresh(job)
            
            # Trigger Celery background task
            run_distillation_job.delay(job.id)
            
            return {
                "id": job.id,
                "name": job.name,
                "objective": job.objective,
                "status": job.status,
                "stage": job.stage,
                "progress": f"{job.progress}%",
                "owner": job.owner,
                "eta": job.eta,
                "created_at": job.created_at.isoformat(),
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating job: {str(e)}")


@app.get("/api/jobs")
def list_jobs(
    skip: int = 0, 
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
) -> list:
    user_id = current_user.get("sub")
    workspace = current_user.get("workspace", "Amber Forge")
    
    with Session(engine) as session:
        jobs = session.query(DistillationJob).filter(
            DistillationJob.user_id == user_id,
            DistillationJob.workspace == workspace
        ).offset(skip).limit(limit).all()
        
        return [
            {
                "id": job.id,
                "name": job.name,
                "objective": job.objective,
                "stage": job.stage,
                "progress": f"{job.progress}%",
                "status": job.status,
                "owner": job.owner,
                "eta": job.eta,
                "gpu_hours": job.gpu_hours,
                "created_at": job.created_at.isoformat(),
            }
            for job in jobs
        ]


@app.websocket("/api/jobs/{job_id}/ws")
async def websocket_job_progress(websocket: WebSocket, job_id: int):
    await websocket.accept()
    pubsub = redis_client.pubsub()
    channel = f"job_progress_{job_id}"
    await pubsub.subscribe(channel)
    
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_text(message['data'])
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        await pubsub.unsubscribe(channel)
    except Exception as e:
        await pubsub.unsubscribe(channel)
        print(f"WebSocket Error: {e}")

@app.post("/api/models/{model_id}/publish")
def publish_model(model_id: int):
    """
    Simulate publishing a model to the Hugging Face Hub or deploying locally.
    In production, this would call huggingface_hub.upload_folder()
    """
    import time
    time.sleep(1) # simulate network request
    return {"status": "success", "message": f"Model {model_id} published successfully"}

@app.get("/api/jobs/{job_id}")
def get_job(job_id: int, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    
    with Session(engine) as session:
        job = session.query(DistillationJob).filter(
            DistillationJob.id == job_id,
            DistillationJob.user_id == user_id
        ).first()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return {
            "id": job.id,
            "name": job.name,
            "objective": job.objective,
            "stage": job.stage,
            "progress": f"{job.progress}%",
            "status": job.status,
            "owner": job.owner,
            "eta": job.eta,
            "gpu_hours": job.gpu_hours,
            "created_at": job.created_at.isoformat(),
        }


@app.put("/api/jobs/{job_id}")
def update_job(job_id: int, payload: dict, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user.get("sub")
    
    try:
        with Session(engine) as session:
            job = session.query(DistillationJob).filter(
                DistillationJob.id == job_id,
                DistillationJob.user_id == user_id
            ).first()
            
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
            
            if "progress" in payload:
                job.progress = int(payload["progress"])
            if "status" in payload:
                job.status = str(payload["status"])
            if "stage" in payload:
                job.stage = str(payload["stage"])
            if "eta" in payload:
                job.eta = str(payload["eta"])
            
            session.commit()
            session.refresh(job)
            
            return {
                "id": job.id,
                "name": job.name,
                "objective": job.objective,
                "stage": job.stage,
                "progress": f"{job.progress}%",
                "status": job.status,
                "owner": job.owner,
                "eta": job.eta,
                "created_at": job.created_at.isoformat(),
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating job: {str(e)}")


# API Key endpoints
@app.post("/api/keys")
def create_api_key(
    payload: dict,
    current_user: dict = Depends(get_current_user)
) -> dict:
    user_id = current_user.get("sub")
    key_name = payload.get("name", "New API Key")
    
    # Generate a secure random key
    raw_key = f"md-{secrets.token_urlsafe(32)}"
    key_hash = hash_password(raw_key) # Store only the hash
    
    try:
        with Session(engine) as session:
            api_key = ApiKey(
                user_id=user_id,
                key_hash=key_hash,
                name=key_name,
            )
            session.add(api_key)
            session.commit()
            
            return {
                "id": api_key.id,
                "name": api_key.name,
                "key": raw_key, # Only return once!
                "created_at": api_key.created_at.isoformat(),
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating API key: {str(e)}")

@app.get("/api/keys")
def list_api_keys(current_user: dict = Depends(get_current_user)) -> list:
    user_id = current_user.get("sub")
    
    with Session(engine) as session:
        keys = session.query(ApiKey).filter(ApiKey.user_id == user_id).all()
        return [
            {
                "id": k.id,
                "name": k.name,
                "created_at": k.created_at.isoformat(),
                "expires_at": k.expires_at.isoformat() if k.expires_at else None,
            }
            for k in keys
        ]
@app.post("/api/hf/generate")
def generate_hf(payload: dict, current_user: dict = Depends(get_current_user)) -> dict:
    model = payload.get("model", "gpt2")
    prompt = payload.get("prompt", "")
    
    if not HUGGINGFACE_API_KEY:
        raise HTTPException(status_code=500, detail="Missing HUGGINGFACE_API_KEY")

    endpoint = f"{HUGGINGFACE_API_URL}/models/{model}"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    body = {"inputs": prompt, "options": {"wait_for_model": True}}

    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(endpoint, json=body, headers=headers)
            if response.status_code >= 400:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            data = response.json()

        if isinstance(data, list) and data:
            output = data[0].get("generated_text") if isinstance(data[0], dict) else str(data[0])
        elif isinstance(data, dict):
            output = data.get("generated_text") or data.get("text") or str(data)
        else:
            output = str(data)

        return {"output": output}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating text: {str(e)}")
