from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from .routers import notes
#from .websocket import websocket_router

app = FastAPI(title="Real-Time Notes Pad API", version="1.0.0")

# Include routers
app.include_router(notes.router, prefix="/api/v1")
#app.include_router(websocket_router, prefix="/ws")

"""
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")
"""
