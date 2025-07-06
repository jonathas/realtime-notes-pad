import pytest
from datetime import datetime
from app.services.note_service import NoteService
from app.models.note import NoteCreate, NoteUpdate
from sqlmodel import Session


class TestNoteService:
    
    @pytest.fixture
    def note_service_instance(self, test_engine):
        """Create a note service instance with test database"""
        service = NoteService()
        
        # Patch the module-level engine import
        import app.services.note_service
        original_engine = app.services.note_service.engine
        app.services.note_service.engine = test_engine
        
        yield service
        
        # Restore original engine
        app.services.note_service.engine = original_engine
    
    def test_create_note(self, note_service_instance):
        """Test creating a note through the service"""
        note_data = NoteCreate(
            title="Service Test Note",
            content="Test content from service"
        )
        
        created_note = note_service_instance.create_note(note_data)
        
        assert created_note.title == note_data.title
        assert created_note.content == note_data.content
        assert created_note.id is not None
        assert isinstance(created_note.created_at, datetime)
        assert isinstance(created_note.updated_at, datetime)
    
    def test_get_note_success(self, note_service_instance):
        """Test getting a note by ID through the service"""
        # Create a note first
        note_data = NoteCreate(title="Test", content="Content")
        created_note = note_service_instance.create_note(note_data)
        
        # Get the note
        retrieved_note = note_service_instance.get_note(created_note.id)
        
        assert retrieved_note is not None
        assert retrieved_note.id == created_note.id
        assert retrieved_note.title == created_note.title
        assert retrieved_note.content == created_note.content
    
    def test_get_note_not_found(self, note_service_instance):
        """Test getting a note that doesn't exist"""
        result = note_service_instance.get_note("nonexistent-id")
        assert result is None
    
    def test_get_all_notes_empty(self, note_service_instance):
        """Test getting all notes when database is empty"""
        all_notes = note_service_instance.get_all_notes()
        assert isinstance(all_notes, list)
        assert len(all_notes) == 0
    
    def test_get_all_notes_with_data(self, note_service_instance):
        """Test getting all notes with existing data"""
        # Create multiple notes
        created_notes = []
        for i in range(3):
            note_data = NoteCreate(title=f"Note {i}", content=f"Content {i}")
            created_note = note_service_instance.create_note(note_data)
            created_notes.append(created_note)
        
        # Get all notes
        all_notes = note_service_instance.get_all_notes()
        
        assert len(all_notes) == 3
        
        # Verify all created notes are in the list
        note_ids = [note.id for note in all_notes]
        for created_note in created_notes:
            assert created_note.id in note_ids
    
    def test_update_note_success(self, note_service_instance):
        """Test updating a note through the service"""
        # Create a note first
        note_data = NoteCreate(title="Original", content="Original content")
        created_note = note_service_instance.create_note(note_data)
        
        # Update the note
        update_data = NoteUpdate(title="Updated", content="Updated content")
        updated_note = note_service_instance.update_note(created_note.id, update_data)
        
        assert updated_note is not None
        assert updated_note.title == "Updated"
        assert updated_note.content == "Updated content"
        assert updated_note.updated_at > created_note.updated_at
    
    def test_update_note_not_found(self, note_service_instance):
        """Test updating a note that doesn't exist"""
        update_data = NoteUpdate(title="Updated")
        result = note_service_instance.update_note("nonexistent-id", update_data)
        assert result is None
    
    def test_delete_note_success(self, note_service_instance):
        """Test deleting a note through the service"""
        # Create a note first
        note_data = NoteCreate(title="To Delete", content="Will be deleted")
        created_note = note_service_instance.create_note(note_data)
        
        # Delete the note
        result = note_service_instance.delete_note(created_note.id)
        assert result is True
        
        # Verify it's deleted
        deleted_note = note_service_instance.get_note(created_note.id)
        assert deleted_note is None
    
    def test_delete_note_not_found(self, note_service_instance):
        """Test deleting a note that doesn't exist"""
        result = note_service_instance.delete_note("nonexistent-id")
        assert result is False