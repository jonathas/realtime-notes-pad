from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from .routers import notes
import os
# from .websocket import websocket_router

app = FastAPI(title="Real-Time Notes Pad API", version="1.0.0")

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
