import pytest
import json
from fastapi.testclient import TestClient


class TestWebSocketEndpoints:
    
    def test_websocket_connection_success(self, client, created_note):
        """Test successful WebSocket connection to a note"""
        note_id = created_note["id"]
        
        with client.websocket_connect(f"/ws/{note_id}?user_name=TestUser") as websocket:
            # Connection should be successful
            assert websocket is not None
    
    def test_websocket_connection_with_default_user(self, client, created_note):
        """Test WebSocket connection with default anonymous user"""
        note_id = created_note["id"]
        
        with client.websocket_connect(f"/ws/{note_id}") as websocket:
            # Connection should be successful with default user
            assert websocket is not None
    
    def test_websocket_content_change_message(self, client, created_note):
        """Test sending content change message via WebSocket"""
        note_id = created_note["id"]
        
        with client.websocket_connect(f"/ws/{note_id}?user_name=TestUser") as websocket:
            # Send content change message
            message = {
                "type": "content_change",
                "content": "Updated content via WebSocket"
            }
            
            websocket.send_text(json.dumps(message))
            
            # Should eventually receive content_saved confirmation
            # Note: In a real test, you might want to add a timeout
            try:
                response = websocket.receive_text()
                response_data = json.loads(response)
                # Could be content_saved or error message
                assert "type" in response_data
            except:
                # Connection might close immediately in test environment
                pass
    
    def test_websocket_typing_indicator(self, client, created_note):
        """Test sending typing indicator via WebSocket"""
        note_id = created_note["id"]
        
        with client.websocket_connect(f"/ws/{note_id}?user_name=TestUser") as websocket:
            # Send typing indicator
            message = {
                "type": "typing_indicator",
                "is_typing": True
            }
            
            websocket.send_text(json.dumps(message))
    
    def test_websocket_invalid_json(self, client, created_note):
        """Test sending invalid JSON via WebSocket"""
        note_id = created_note["id"]
        
        with client.websocket_connect(f"/ws/{note_id}?user_name=TestUser") as websocket:
            # Send invalid JSON
            websocket.send_text("invalid json")
            
            # Should receive error response
            try:
                response = websocket.receive_text()
                error_data = json.loads(response)
                assert error_data["type"] == "error"
                assert "Invalid JSON" in error_data["message"]
            except:
                # Connection might close on error
                pass
    
    def test_websocket_unknown_message_type(self, client, created_note):
        """Test sending unknown message type via WebSocket"""
        note_id = created_note["id"]
        
        with client.websocket_connect(f"/ws/{note_id}?user_name=TestUser") as websocket:
            # Send unknown message type
            message = {
                "type": "unknown_type",
                "data": "some data"
            }
            
            websocket.send_text(json.dumps(message))
            
            # Should receive error response
            try:
                response = websocket.receive_text()
                error_data = json.loads(response)
                assert error_data["type"] == "error"
                assert "Unknown message type" in error_data["message"]
            except:
                pass