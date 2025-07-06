import pytest
from fastapi.testclient import TestClient

class TestNotesAPI:
    
    def test_health_check(self, client):
        """Test the health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
    
    def test_create_note_success(self, client, sample_note_data):
        """Test creating a new note successfully"""
        response = client.post("/api/v1/notes", json=sample_note_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == sample_note_data["title"]
        assert data["content"] == sample_note_data["content"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        
        # Verify ID is a valid UUID
        import uuid
        assert uuid.UUID(data["id"])
    
    def test_create_note_validation_errors(self, client):
        """Test note creation with invalid data"""
        # Missing required fields
        response = client.post("/api/v1/notes", json={})
        assert response.status_code == 422
        
        # Invalid data types
        response = client.post("/api/v1/notes", json={
            "title": 123,  # Should be string
            "content": None  # Should be string
        })
        assert response.status_code == 422
    
    def test_get_all_notes_empty(self, client):
        """Test getting all notes when database is empty"""
        response = client.get("/api/v1/notes")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_get_all_notes_with_data(self, client, multiple_notes):
        """Test getting all notes with existing data"""
        response = client.get("/api/v1/notes")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        
        # Check if our created notes are in the list
        note_ids = [note["id"] for note in data]
        for created_note in multiple_notes:
            assert created_note["id"] in note_ids
    
    def test_get_note_by_id_success(self, client, created_note):
        """Test getting a specific note by ID"""
        note_id = created_note["id"]
        response = client.get(f"/api/v1/notes/{note_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == note_id
        assert data["title"] == created_note["title"]
        assert data["content"] == created_note["content"]
        assert data["created_at"] == created_note["created_at"]
        assert data["updated_at"] == created_note["updated_at"]
    
    def test_get_note_not_found(self, client):
        """Test getting a note that doesn't exist"""
        response = client.get("/api/v1/notes/nonexistent-id")
        
        assert response.status_code == 404
        assert "Note not found" in response.json()["detail"]
    
    def test_update_note_success(self, client, created_note):
        """Test updating a note successfully"""
        note_id = created_note["id"]
        update_data = {
            "title": "Updated Title",
            "content": "Updated content"
        }
        
        response = client.put(f"/api/v1/notes/{note_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["content"] == update_data["content"]
        assert data["id"] == note_id
        # Updated timestamp should be different
        assert data["updated_at"] != created_note["updated_at"]
    
    def test_update_note_partial(self, client, created_note):
        """Test partially updating a note (only title)"""
        note_id = created_note["id"]
        update_data = {"title": "Only Title Updated"}
        
        response = client.put(f"/api/v1/notes/{note_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["content"] == created_note["content"]  # Should remain unchanged
    
    def test_update_note_not_found(self, client):
        """Test updating a note that doesn't exist"""
        update_data = {"title": "New Title"}
        response = client.put("/api/v1/notes/nonexistent-id", json=update_data)
        
        assert response.status_code == 404
        assert "Note not found" in response.json()["detail"]
    
    def test_delete_note_success(self, client, created_note):
        """Test deleting a note successfully"""
        note_id = created_note["id"]
        
        # Delete the note
        response = client.delete(f"/api/v1/notes/{note_id}")
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]
        
        # Verify it's actually deleted
        response = client.get(f"/api/v1/notes/{note_id}")
        assert response.status_code == 404
    
    def test_delete_note_not_found(self, client):
        """Test deleting a note that doesn't exist"""
        response = client.delete("/api/v1/notes/nonexistent-id")
        assert response.status_code == 404
        assert "Note not found" in response.json()["detail"]