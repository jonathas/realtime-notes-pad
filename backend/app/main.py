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
    try:
        # Create tables on startup
        print("Creating database tables...")
        create_db_and_tables()
        print("Database tables created successfully")
        
        # Seed initial data
        print("Seeding initial data...")
        seed_initial_data()
        print("Seeding completed")
        
    except Exception as e:
        print(f"Startup error: {e}")
        import traceback
        traceback.print_exc()
        
    yield

def seed_initial_data():
    try:
        print("Checking existing notes...")
        existing_notes = note_service.get_all_notes()
        print(f"Found {len(existing_notes)} existing notes")
        
        if len(existing_notes) == 0:
            print("Creating initial note...")
            initial_note = NoteCreate(
                title="Welcome to Real-Time Notes Pad",
                content="Start typing your notes here..."
            )
            created_note = note_service.create_note(initial_note)
            print(f"Created initial note with ID: {created_note.id}")
        else:
            print("Database already has notes, skipping seed")
            for note in existing_notes:
                print(f"Existing note: {note.id} - {note.title}")
                
    except Exception as e:
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()

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
