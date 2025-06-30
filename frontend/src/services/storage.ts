import { apiClient } from "./api-client";

export interface Note {
  id: string;
  title: string;
  content: string;
}

const STORAGE_KEY = "current-note";

export const loadNote = (): Promise<Note> => {
  return apiClient.get<Note>(`/notes/${STORAGE_KEY}`);
};

export const loadAllNotes = (): Promise<Note[]> => {
  return apiClient.get<Note[]>(`/notes`);
};

export const createNote = async (note: Note): Promise<void> => {
  await apiClient.post<void>(`/notes`, note);
}

export const updateNote = async (note: Note): Promise<void> => {
  await apiClient.put<void>(`/notes/${note.id}`, note);
}

export const deleteNote = async (): Promise<void> => {
  await apiClient.delete<void>(`/notes/${STORAGE_KEY}`);
}
