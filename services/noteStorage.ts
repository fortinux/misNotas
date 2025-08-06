import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/types/note';

const NOTES_KEY = 'notes_app_data';

export class NoteStorage {
  static async getAllNotes(): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  static async saveNote(note: Note): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const existingIndex = notes.findIndex(n => n.id === note.id);
      
      if (existingIndex >= 0) {
        notes[existingIndex] = note;
      } else {
        notes.unshift(note);
      }
      
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }

  static async deleteNote(noteId: string): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  static async searchNotes(query: string): Promise<Note[]> {
    try {
      const notes = await this.getAllNotes();
      const lowercaseQuery = query.toLowerCase();
      
      return notes.filter(note => 
        note.title.toLowerCase().includes(lowercaseQuery) ||
        (note.type === 'text' && note.content.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }
}