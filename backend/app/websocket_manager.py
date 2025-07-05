from typing import Dict, List
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime, timezone

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Store user info per connection
        self.connection_info: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, note_id: str, user_name: str = "Anonymous"):
        """Connect a user to a specific note room"""
        await websocket.accept()
        
        # Add to note room
        if note_id not in self.active_connections:
            self.active_connections[note_id] = []
        self.active_connections[note_id].append(websocket)
        
        # Store user info
        self.connection_info[websocket] = {
            "note_id": note_id,
            "user_name": user_name,
            "connected_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Notify others in the room that someone joined
        await self.broadcast_to_room(note_id, {
            "type": "user_joined",
            "user_name": user_name,
            "message": f"{user_name} joined the note",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "active_users": self.get_room_users(note_id)
        }, exclude_websocket=websocket)
        
        # Send current room info to the new user
        await self.send_personal_message({
            "type": "room_joined",
            "note_id": note_id,
            "message": f"Connected to note: {note_id}",
            "active_users": self.get_room_users(note_id),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        """Disconnect a user and notify the room"""
        if websocket in self.connection_info:
            user_info = self.connection_info[websocket]
            note_id = user_info["note_id"]
            user_name = user_info["user_name"]
            
            # Remove from room
            if note_id in self.active_connections:
                self.active_connections[note_id].remove(websocket)
                
                # Clean up empty rooms
                if not self.active_connections[note_id]:
                    del self.active_connections[note_id]
                else:
                    # Notify others that user left
                    asyncio.create_task(self.broadcast_to_room(note_id, {
                        "type": "user_left",
                        "user_name": user_name,
                        "message": f"{user_name} left the note",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "active_users": self.get_room_users(note_id)
                    }))
            
            # Remove user info
            del self.connection_info[websocket]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific websocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except:
            # Connection might be closed
            self.disconnect(websocket)

    async def broadcast_to_room(self, note_id: str, message: dict, exclude_websocket: WebSocket = None):
        """Broadcast message to all users in a specific note room"""
        if note_id not in self.active_connections:
            return
            
        disconnected = []
        for websocket in self.active_connections[note_id]:
            if websocket == exclude_websocket:
                continue
                
            try:
                await websocket.send_text(json.dumps(message))
            except:
                # Connection is dead, mark for removal
                disconnected.append(websocket)
        
        # Clean up dead connections
        for websocket in disconnected:
            self.disconnect(websocket)

    def get_room_users(self, note_id: str) -> List[str]:
        """Get list of users in a specific room"""
        if note_id not in self.active_connections:
            return []
        
        users = []
        for websocket in self.active_connections[note_id]:
            if websocket in self.connection_info:
                users.append(self.connection_info[websocket]["user_name"])
        return users

    def get_room_count(self, note_id: str) -> int:
        """Get number of users in a room"""
        return len(self.active_connections.get(note_id, []))

manager = ConnectionManager()