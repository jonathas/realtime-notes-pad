from datetime import datetime, timezone
import json
from ..websocket_manager import manager
from ..services.note_service import note_service
from fastapi import WebSocket
import asyncio
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class WebSocketService:
    def __init__(self):
        self._pending_updates: Dict[str, dict] = {}
        self._update_tasks: Dict[str, asyncio.Task] = {}
    
    async def handle_message(self, websocket: WebSocket, note_id: str, user_name: str, message_data: dict):
        """Handle incoming WebSocket messages based on type"""
        
        # Add metadata
        message_data.update({
            "user_name": user_name,
            "note_id": note_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        message_type = message_data.get("type")
        logger.info(f"Handling message type: {message_type} from {user_name}")
        
        try:
            if message_type == "content_change":
                await self._handle_content_change(websocket, note_id, user_name, message_data)
            elif message_type == "cursor_position":
                await self._handle_cursor_position(websocket, note_id, user_name, message_data)
            elif message_type == "typing_indicator":
                await self._handle_typing_indicator(websocket, note_id, user_name, message_data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                await self._handle_unknown_message(websocket, note_id, user_name, message_data)
        except Exception as e:
            logger.error(f"Error handling message: {e}", exc_info=True)
            raise
    
    async def _handle_content_change(self, websocket: WebSocket, note_id: str, user_name: str, message_data: dict):
        """Handle content change messages with debouncing"""
        content = message_data.get("content", "")
        logger.info(f"Content change from {user_name}: {len(content)} characters")
        
        # Store the latest update for debouncing
        self._pending_updates[note_id] = {
            "content": content,
            "user_name": user_name,
            "timestamp": message_data["timestamp"],
            "websocket": websocket
        }
        
        # Cancel existing task
        if note_id in self._update_tasks:
            self._update_tasks[note_id].cancel()
        
        # Create new debounced task
        self._update_tasks[note_id] = asyncio.create_task(
            self._send_debounced_update(note_id)
        )
        
        # Immediately broadcast to other users (don't wait for debounce)
        await manager.broadcast_to_room(note_id, {
            "type": "content_change",
            "content": content,
            "user_name": user_name,
            "timestamp": message_data["timestamp"]
        }, exclude_websocket=websocket)
    
    async def _send_debounced_update(self, note_id: str):
        """Send update to database after debounce delay"""
        await asyncio.sleep(0.3)  # 300ms debounce
        
        if note_id in self._pending_updates:
            update = self._pending_updates[note_id]
            
            try:
                # Save to database via note_service
                from ..models.note import NoteUpdate
                note_update = NoteUpdate(content=update["content"])
                
                # Check if note_service.update_note is async
                if asyncio.iscoroutinefunction(note_service.update_note):
                    await note_service.update_note(note_id, note_update)
                else:
                    note_service.update_note(note_id, note_update)
                
                logger.info(f"Saved note {note_id} to database")

                await update["websocket"].send_text(json.dumps({
                  "type": "content_saved",
                  "timestamp": datetime.now(timezone.utc).isoformat()
                }))
                
            except Exception as e:
                logger.error(f"Error saving update to database: {e}", exc_info=True)
            finally:
                # Clean up
                if note_id in self._pending_updates:
                    del self._pending_updates[note_id]
                if note_id in self._update_tasks:
                    del self._update_tasks[note_id]
    
    async def _handle_cursor_position(self, websocket: WebSocket, note_id: str, user_name: str, message_data: dict):
        """Handle cursor position messages"""
        await manager.broadcast_to_room(note_id, {
            "type": "cursor_position",
            "position": message_data.get("position"),
            "user_name": user_name,
            "timestamp": message_data["timestamp"]
        }, exclude_websocket=websocket)
    
    async def _handle_typing_indicator(self, websocket: WebSocket, note_id: str, user_name: str, message_data: dict):
        """Handle typing indicator messages"""
        is_typing = message_data.get("is_typing", False)
        logger.info(f"{user_name} typing: {is_typing}")
        
        await manager.broadcast_to_room(note_id, {
            "type": "typing_indicator",
            "is_typing": is_typing,
            "user_name": user_name,
            "timestamp": message_data["timestamp"]
        }, exclude_websocket=websocket)
    
    async def _handle_unknown_message(self, websocket: WebSocket, note_id: str, user_name: str, message_data: dict):
        """Handle unknown message types"""
        logger.warning(f"Unknown message type from {user_name}: {message_data}")
        # Send error back to sender
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Unknown message type: {message_data.get('type')}"
        }))

websocket_service = WebSocketService()