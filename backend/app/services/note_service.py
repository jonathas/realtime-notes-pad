from typing import List, Optional
from sqlmodel import Session, select
from ..models.note import Note, NoteCreate, NoteUpdate
from ..database import engine
from datetime import datetime

class NoteService:
    
    def create_note(self, note_data: NoteCreate) -> Note:
        with Session(engine) as session:
            note = Note(
                title=note_data.title,
                content=note_data.content,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            session.add(note)
            session.commit()
            session.refresh(note)
            return note
    
    def get_note(self, note_id: str) -> Optional[Note]:
        with Session(engine) as session:
            return session.get(Note, note_id)
    
    def get_all_notes(self) -> List[Note]:
        with Session(engine) as session:
            statement = select(Note)
            return session.exec(statement).all()
    
    def update_note(self, note_id: str, note_update: NoteUpdate) -> Optional[Note]:
        with Session(engine) as session:
            note = session.get(Note, note_id)
            if not note:
                return None
            
            update_data = note_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(note, field, value)
            
            note.updated_at = datetime.now()
            session.add(note)
            session.commit()
            session.refresh(note)
            return note
    
    def delete_note(self, note_id: str) -> bool:
        with Session(engine) as session:
            note = session.get(Note, note_id)
            if note:
                session.delete(note)
                session.commit()
                return True
            return False

note_service = NoteService()