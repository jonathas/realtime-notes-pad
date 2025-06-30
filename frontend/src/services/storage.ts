export interface Note {
  id: string;
  title: string;
  content: string;
}

const STORAGE_KEY = "current-note";

export async function loadNote(): Promise<Note | null> {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function saveNote(note: Note): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
}
