import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Note, TextNote } from '@/types/note';
import { NoteStorage } from '@/services/noteStorage';
import NoteCard from '@/components/NoteCard';
import TextNoteEditor from '@/components/TextNoteEditor';
import AudioPlayer from '@/components/AudioPlayer';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<TextNote | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const loadNotes = async () => {
    setIsLoading(true);
    const loadedNotes = await NoteStorage.getAllNotes();
    setNotes(loadedNotes);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleEditNote = (note: Note) => {
    if (note.type === 'text') {
      setEditingNote(note);
      setShowEditor(true);
    }
  };

  const handleSaveNote = async (title: string, content: string) => {
    const now = new Date().toISOString();
    
    const note: TextNote = {
      id: editingNote?.id || Date.now().toString(),
      type: 'text',
      title,
      content,
      createdAt: editingNote?.createdAt || now,
      updatedAt: now,
    };

    await NoteStorage.saveNote(note);
    setShowEditor(false);
    setEditingNote(null);
    loadNotes();
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await NoteStorage.deleteNote(noteId);
            loadNotes();
          },
        },
      ]
    );
  };

  const handlePlayAudio = async (audioUri: string) => {
    try {
      if (playingAudio === audioUri) {
        setPlayingAudio(null);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      setPlayingAudio(audioUri);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const renderNote = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onEdit={handleEditNote}
      onDelete={handleDeleteNote}
      onPlay={handlePlayAudio}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptyText}>
        Tap the + button to create your first note, or go to the Record tab to record a voice note.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateNote}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      <Modal
        visible={showEditor}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <TextNoteEditor
          title={editingNote?.title}
          content={editingNote?.content}
          onSave={handleSaveNote}
          onCancel={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});