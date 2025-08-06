import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Save, X } from 'lucide-react-native';

interface TextNoteEditorProps {
  title?: string;
  content?: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export default function TextNoteEditor({ title = '', content = '', onSave, onCancel }: TextNoteEditorProps) {
  const [noteTitle, setNoteTitle] = useState(title);
  const [noteContent, setNoteContent] = useState(content);

  const handleSave = () => {
    if (noteTitle.trim() || noteContent.trim()) {
      onSave(noteTitle.trim() || 'Untitled Note', noteContent.trim());
    }
  };

  const canSave = noteTitle.trim() || noteContent.trim();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {title ? 'Edit Note' : 'New Note'}
        </Text>
        <TouchableOpacity 
          onPress={handleSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          disabled={!canSave}
        >
          <Save size={24} color={canSave ? "#FFFFFF" : "#9CA3AF"} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note title..."
          value={noteTitle}
          onChangeText={setNoteTitle}
          placeholderTextColor="#9CA3AF"
        />
        
        <TextInput
          style={styles.contentInput}
          placeholder="Start typing your note..."
          value={noteContent}
          onChangeText={setNoteContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 60,
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingVertical: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    paddingVertical: 8,
  },
});