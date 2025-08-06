import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, Mic, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onPlay?: (audioUri: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onPlay }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {note.type === 'text' ? (
            <FileText size={20} color="#3B82F6" />
          ) : (
            <Mic size={20} color="#8B5CF6" />
          )}
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDate(note.createdAt)}
        </Text>
      </View>

      <View style={styles.content}>
        {note.type === 'text' ? (
          <Text style={styles.preview} numberOfLines={3}>
            {note.content || 'No content'}
          </Text>
        ) : (
          <TouchableOpacity 
            style={styles.voicePreview}
            onPress={() => onPlay?.(note.audioUri)}
          >
            <Text style={styles.voiceText}>
              Voice Note • {formatDuration(note.duration)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEdit(note)}
        >
          <Edit3 size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onDelete(note.id)}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  content: {
    marginBottom: 12,
  },
  preview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  voicePreview: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  voiceText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
});