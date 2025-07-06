import pytest
import os
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Fix: Import the FastAPI app instance explicitly
from app.main import app as fastapi_app
from app.models.note import Note


@pytest.fixture(scope="function")
def test_engine():
    """Create a test database engine using in-memory SQLite for each test"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(scope="function")
def client(test_engine):
    """Create a test client with isolated database"""
    # Patch the engine at the module level where it's imported
    import app.services.note_service
    original_engine = app.services.note_service.engine
    app.services.note_service.engine = test_engine
    
    # Use the renamed import
    with TestClient(fastapi_app) as test_client:
        yield test_client
    
    # Cleanup
    app.services.note_service.engine = original_engine


@pytest.fixture
def sample_note_data():
    """Sample note data for testing"""
    return {
        "title": "Test Note", 
        "content": "This is a test note content"
    }


@pytest.fixture
def created_note(client, sample_note_data):
    """Create a note for testing"""
    response = client.post("/api/v1/notes", json=sample_note_data)
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def multiple_notes(client):
    """Create multiple notes for testing"""
    notes = []
    for i in range(3):
        note_data = {
            "title": f"Test Note {i}",
            "content": f"Content for test note {i}"
        }
        response = client.post("/api/v1/notes", json=note_data)
        assert response.status_code == 200
        notes.append(response.json())
    return notes