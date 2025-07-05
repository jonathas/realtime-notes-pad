from datetime import datetime, timezone
from ..websocket_manager import manager
from fastapi import WebSocket
import asyncio
from typing import Dict

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
        
        if message_type == "content_change":
            await self._handle_content_change(websocket, note_id, user_name, message_data)
        elif message_type == "cursor_position":
            await self._handle_cursor_position(websocket, note_id, user_name, message_data)
        elif message_type == "typing_indicator":
            await self._handle_typing_indicator(websocket, note_id, user_name, message_data)
        else:
            await self._handle_chat_message(websocket, note_id, user_name, message_data)
    
    async def _handle_content_change(self, websocket: WebSocket, note_id: str, user_name: str, message_data: dict):
        """Handle content change messages with debouncing"""
        content = message_data.get("content", "")
        
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
    
    async def _send_debounced_update(self, note_id: str):
        """Send update after debounce delay"""
        await asyncio.sleep(0.3)  # 300ms debounce
        
        if note_id in self._pending_updates:
            update = self._pending_updates[note_id]
            
            await manager.broadcast_to_room(note_id, {
                "type": "content_change",
                "content": update["content"],
                "user_name": update["user_name"],
                "timestamp": update["timestamp"]
            }, exclude_websocket=update["websocket"])
            
            # Clean up
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
        await manager.broadcast_to_room(note_id, {
            "type": "typing_indicator",
            "is_typing": message_data.get("is_typing", False),
            "user_name": user_name,
            "timestamp": message_data["timestamp"]
        }, exclude_websocket=websocket)
    
    async def _handle_chat_message(self, websocket: WebSocket, note_id: str, user_name: str, message_data: dict):
        """Handle general chat messages"""
        await manager.broadcast_to_room(note_id, {
            "type": "message",
            "message": message_data.get("message", ""),
            "user_name": user_name,
            "timestamp": message_data["timestamp"]
        })

websocket_service = WebSocketService()