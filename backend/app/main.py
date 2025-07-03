from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from .routers import notes
from .database import create_db_and_tables  # Import here
from .services.note_service import note_service
from .models.note import NoteCreate
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    create_db_and_tables()
    
    # Seed initial data
    await seed_initial_data()
    yield

async def seed_initial_data():
    existing_notes = await note_service.get_all_notes()
    if len(existing_notes) == 0:
        initial_note = NoteCreate(
            title="Welcome to Real-Time Notes Pad",
            content="Start typing your notes here..."
        )
        await note_service.create_note(initial_note)

app = FastAPI(
    title="Real-Time Notes Pad API", 
    version="1.0.0",
    lifespan=lifespan
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:5173",
] + cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router, prefix="/api/v1")
# app.include_router(websocket_router, prefix="/ws")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

"""
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")
"""
