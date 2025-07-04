from typing import List, Optional
from sqlmodel import Session, select
from ..models.note import Note, NoteCreate, NoteUpdate, NoteListItem
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
    
    def get_all_notes(self) -> List[NoteListItem]:
        with Session(engine) as session:
            statement = select(Note.id, Note.title, Note.created_at, Note.updated_at)
            results = session.exec(statement).all()
            
            return [
                NoteListItem(
                    id=row.id,
                    title=row.title,
                    created_at=row.created_at,
                    updated_at=row.updated_at
                )
                for row in results
            ]
    
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