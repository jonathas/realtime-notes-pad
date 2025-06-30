from typing import List, Optional
from ..models.note import Note, NoteCreate, NoteUpdate
import uuid
from datetime import datetime

class NoteService:
    def __init__(self):
        # In-memory storage for now, replace with database later
        self._notes: dict[str, Note] = {}
    
    async def create_note(self, note_data: NoteCreate) -> Note:
        note_id = str(uuid.uuid4())
        now = datetime.now()
        
        note = Note(
            id=note_id,
            title=note_data.title,
            content=note_data.content,
            created_at=now,
            updated_at=now
        )
        
        self._notes[note_id] = note
        return note
    
    async def get_note(self, note_id: str) -> Optional[Note]:
        return self._notes.get(note_id)
    
    async def get_all_notes(self) -> List[Note]:
        return list(self._notes.values())
    
    async def update_note(self, note_id: str, note_update: NoteUpdate) -> Optional[Note]:
        if note_id not in self._notes:
            return None
        
        note = self._notes[note_id]
        update_data = note_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(note, field, value)
        
        note.updated_at = datetime.now()
        return note
    
    async def delete_note(self, note_id: str) -> bool:
        if note_id in self._notes:
            del self._notes[note_id]
            return True
        return False

# Singleton instance
note_service = NoteService()