from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from ..websocket_manager import manager
from ..services.websocket_service import websocket_service  # Import the instance, not the class
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/{note_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    note_id: str,
    user_name: str = Query(default="Anonymous")
):
    await manager.connect(websocket, note_id)
    logger.info(f"User {user_name} connected to note {note_id}")
    
    try:
        while True:
            # Receive text data from WebSocket
            data = await websocket.receive_text()
            logger.info(f"Received message: {data}")
            
            try:
                # Parse JSON message
                message_data = json.loads(data)
                logger.info(f"Parsed message: {message_data}")
                
                # Fix: Use the instance, not the class
                await websocket_service.handle_message(
                    websocket=websocket,
                    note_id=note_id,
                    user_name=user_name,
                    message_data=message_data
                )
                
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
                
            except Exception as e:
                logger.error(f"Error handling message: {e}", exc_info=True)
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": f"Error processing message: {str(e)}"
                }))
                
    except WebSocketDisconnect:
        logger.info(f"User {user_name} disconnected from note {note_id}")
        manager.disconnect(websocket, note_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        manager.disconnect(websocket, note_id)