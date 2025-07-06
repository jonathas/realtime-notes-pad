from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routers import notes, websockets
from .database import create_db_and_tables
from .seed import seed_initial_data
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up Real-Time Notes Pad API...")
    
    # Create tables
    print("📊 Creating database tables...")
    create_db_and_tables()
    print("✅ Database tables created successfully")
    
    # Skip seeding during tests
    if not os.getenv("PYTEST_CURRENT_TEST"):
        print("🌱 Seeding initial data...")
        seed_initial_data()
        print("✅ Seeding completed")
    
    print("🎉 Application startup complete!")
    yield
    print("🛑 Shutting down Real-Time Notes Pad API...")

app = FastAPI(
    title="Real-Time Notes Pad API", 
    version="1.0.0",
    lifespan=lifespan
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173", 
    "http://127.0.0.1:4173",
] + cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(notes.router, prefix="/api/v1")
app.include_router(websockets.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

