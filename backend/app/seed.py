from .services.note_service import note_service
from .models.note import NoteCreate

def seed_initial_data():
    try:
        print("Checking existing notes...")
        existing_notes = note_service.get_all_notes()
        print(f"Found {len(existing_notes)} existing notes")
        
        if len(existing_notes) == 0:
            print("Creating initial note...")
            initial_note = NoteCreate(
                title="Welcome to Real-Time Notes Pad",
                content="Start typing your notes here..."
            )
            created_note = note_service.create_note(initial_note)
            print(f"Created initial note with ID: {created_note.id}")
        else:
            print("Database already has notes, skipping seed")
            for note in existing_notes:
                print(f"Existing note: {note.id} - {note.title}")
                
    except Exception as e:
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()