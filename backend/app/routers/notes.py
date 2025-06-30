from fastapi import APIRouter, HTTPException
from typing import List
from ..models.note import Note, NoteCreate, NoteUpdate
from ..services.note_service import note_service

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("/", response_model=Note)
async def create_note(note: NoteCreate):
    return await note_service.create_note(note)

@router.get("/", response_model=List[Note])
async def get_notes():
    return await note_service.get_all_notes()

@router.get("/{note_id}", response_model=Note)
async def get_note(note_id: str):
    note = await note_service.get_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{note_id}", response_model=Note)
async def update_note(note_id: str, note_update: NoteUpdate):
    note = await note_service.update_note(note_id, note_update)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.delete("/{note_id}")
async def delete_note(note_id: str):
    success = await note_service.delete_note(note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}