import { apiClient } from "./api-client";

export interface Note {
  id: string;
  title: string;
  content: string;
}

const STORAGE_KEY = "4ef5b209-f118-4e36-a6ca-66dfef4e304b";

export const loadNote = (): Promise<Note> => {
  return apiClient.get<Note>(`/notes/${STORAGE_KEY}`);
};

export const loadAllNotes = (): Promise<Note[]> => {
  return apiClient.get<Note[]>(`/notes`);
};

export const createNote = (note: Note): Promise<Note> => {
  return apiClient.post<Note>(`/notes`, note);
}

export const updateNote = (note: Note): Promise<Note> => {
  return apiClient.put<Note>(`/notes/${note.id}`, note);
}

export const deleteNote = async (): Promise<void> => {
  await apiClient.delete<void>(`/notes/${STORAGE_KEY}`);
}
