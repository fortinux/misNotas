import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { VoiceNote } from '@/types/note';
import { NoteStorage } from '@/services/noteStorage';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function RecordScreen() {
  const [title, setTitle] = useState('');
  const [recordedAudio, setRecordedAudio] = useState<{
    uri: string;
    duration: number;
  } | null>(null);

  const handleSaveVoiceNote = (audioUri: string, duration: number) => {
    setRecordedAudio({ uri: audioUri, duration });
  };

  const handleSaveNote = async () => {
    if (!recordedAudio) {
      Alert.alert('Error', 'Please record audio first');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your voice note');
      return;
    }

    const now = new Date().toISOString();
    
    const note: VoiceNote = {
      id: Date.now().toString(),
      type: 'voice',
      title: title.trim(),
      audioUri: recordedAudio.uri,
      duration: recordedAudio.duration,
      createdAt: now,
      updatedAt: now,
    };

    await NoteStorage.saveNote(note);
    
    // Reset form
    setTitle('');
    setRecordedAudio(null);
    
    Alert.alert('Success', 'Voice note saved successfully!', [
      {
        text: 'View Notes',
        onPress: () => router.push('/(tabs)/'),
      },
      {
        text: 'Record Another',
        style: 'cancel',
      },
    ]);
  };

  const handleDiscard = () => {
    setRecordedAudio(null);
    setTitle('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Notes</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.label}>Note Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter a title for your voice note"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.recorderSection}>
          <Text style={styles.label}>Recording</Text>
          <VoiceRecorder onSave={handleSaveVoiceNote} />
        </View>

        {recordedAudio && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.discardButton}
              onPress={handleDiscard}
            >
              <Text style={styles.discardText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
              onPress={handleSaveNote}
              disabled={!title.trim()}
            >
              <Text style={styles.saveText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recorderSection: {
    flex: 1,
    justifyContent: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 24,
  },
  discardButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  discardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});