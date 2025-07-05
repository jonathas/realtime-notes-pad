from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import json
from ..websocket_manager import manager
from ..services.websocket_service import WebSocketService

router = APIRouter()

@router.websocket("/ws/{note_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    note_id: str,
    user_name: str = Query(default="Anonymous")
):
    """WebSocket endpoint for real-time collaboration on a specific note"""
    await manager.connect(websocket, note_id, user_name)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            await WebSocketService.handle_message(websocket, note_id, user_name, message_data)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/notes/{note_id}/users")
async def get_note_users(note_id: str):
    """Get list of users currently connected to a note"""
    return {
        "note_id": note_id,
        "users": manager.get_room_users(note_id),
        "user_count": manager.get_room_count(note_id)
    }