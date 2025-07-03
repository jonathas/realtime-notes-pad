from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class NoteBase(SQLModel):
    title: str
    content: str

class Note(NoteBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class NoteCreate(NoteBase):
    pass

class NoteUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteRead(NoteBase):
    id: str
    created_at: datetime
    updated_at: datetime