import { apiClient } from "./api-client";

export interface Note {
  id: string;
  title: string;
  content?: string;
  updated_at: string;
  created_at: string;
}

export type CreateNoteInput = Omit<Note, 'id' | 'updated_at' | 'created_at'>;

export type UpdateNoteInput = Omit<Note, 'created_at' | 'updated_at'>;

export const loadNote = (id: string): Promise<Note> => {
  return apiClient.get<Note>(`/notes/${id}`);
};

export const loadAllNotes = (): Promise<Note[]> => {
  return apiClient.get<Note[]>(`/notes`);
};

export const createNote = (note: CreateNoteInput): Promise<Note> => {
  return apiClient.post<Note>(`/notes`, note);
}

export const updateNote = (note: UpdateNoteInput): Promise<Note> => {
  return apiClient.put<Note>(`/notes/${note.id}`, note);
}

export const deleteNote = async (id: string): Promise<void> => {
  await apiClient.delete<void>(`/notes/${id}`);
}
