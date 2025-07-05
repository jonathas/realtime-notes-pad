from typing import Dict, List
from fastapi import WebSocket
import json
from datetime import datetime, timezone

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, note_id: str):
        await websocket.accept()
        
        if note_id not in self.active_connections:
            self.active_connections[note_id] = []
        
        self.active_connections[note_id].append(websocket)

    def disconnect(self, websocket: WebSocket, note_id: str):
        if note_id in self.active_connections:
            if websocket in self.active_connections[note_id]:
                self.active_connections[note_id].remove(websocket)
            
            # Clean up empty note rooms
            if not self.active_connections[note_id]:
                del self.active_connections[note_id]

    async def broadcast_to_room(self, note_id: str, message: dict, exclude_websocket: WebSocket = None):
        """Broadcast message to all users in a specific note room"""
        if note_id not in self.active_connections:
            return
            
        message_str = json.dumps(message)
        connections_to_remove = []
        
        for websocket in self.active_connections[note_id]:
            if exclude_websocket and websocket == exclude_websocket:
                continue
                
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                connections_to_remove.append(websocket)
        
        # Remove broken connections
        for websocket in connections_to_remove:
            self.disconnect(websocket, note_id)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()