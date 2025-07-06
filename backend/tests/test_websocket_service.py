import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.websocket_service import WebSocketService


class TestWebSocketService:
    
    @pytest.fixture
    def websocket_service(self):
        return WebSocketService()
    
    @pytest.fixture
    def mock_websocket(self):
        websocket = AsyncMock()
        websocket.send_text = AsyncMock()
        return websocket
    
    @pytest.mark.asyncio
    async def test_handle_content_change_message(self, websocket_service, mock_websocket):
        """Test handling content change messages"""
        message_data = {
            "type": "content_change",
            "content": "Hello World"
        }
        
        with patch.object(websocket_service, '_handle_content_change') as mock_handler:
            await websocket_service.handle_message(
                websocket=mock_websocket,
                note_id="test-note-id",
                user_name="test-user",
                message_data=message_data
            )
            
            mock_handler.assert_called_once()
            # Check the call arguments (they're positional, not keyword)
            call_args = mock_handler.call_args[0]  # positional arguments
            assert call_args[1] == "test-note-id"  # note_id
            assert call_args[2] == "test-user"     # user_name
    
    @pytest.mark.asyncio
    async def test_handle_typing_indicator_message(self, websocket_service, mock_websocket):
        """Test handling typing indicator messages"""
        message_data = {
            "type": "typing_indicator",
            "is_typing": True
        }
        
        with patch.object(websocket_service, '_handle_typing_indicator') as mock_handler:
            await websocket_service.handle_message(
                websocket=mock_websocket,
                note_id="test-note-id", 
                user_name="test-user",
                message_data=message_data
            )
            
            mock_handler.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_unknown_message_type(self, websocket_service, mock_websocket):
        """Test handling unknown message types"""
        message_data = {
            "type": "unknown_type",
            "data": "some data"
        }
        
        await websocket_service.handle_message(
            websocket=mock_websocket,
            note_id="test-note-id",
            user_name="test-user", 
            message_data=message_data
        )
        
        # Should send error response
        mock_websocket.send_text.assert_called()
        call_args = mock_websocket.send_text.call_args[0][0]
        error_message = json.loads(call_args)
        assert error_message["type"] == "error"
        assert "Unknown message type" in error_message["message"]
    
    @pytest.mark.asyncio
    async def test_content_change_broadcasting(self, websocket_service, mock_websocket):
        """Test that content changes are broadcast to other users"""
        message_data = {
            "type": "content_change",
            "content": "New content",
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        with patch('app.services.websocket_service.manager') as mock_manager:
            # Make the broadcast_to_room method async
            mock_manager.broadcast_to_room = AsyncMock()
            
            await websocket_service._handle_content_change(
                websocket=mock_websocket,
                note_id="test-note-id",
                user_name="test-user",
                message_data=message_data
            )
            
            # Should broadcast to other users
            mock_manager.broadcast_to_room.assert_called()
            
            # Check broadcast message
            call_args = mock_manager.broadcast_to_room.call_args
            broadcast_note_id = call_args[0][0]
            broadcast_message = call_args[0][1]
            
            assert broadcast_note_id == "test-note-id"
            assert broadcast_message["type"] == "content_change"
            assert broadcast_message["content"] == "New content"
            assert broadcast_message["user_name"] == "test-user"