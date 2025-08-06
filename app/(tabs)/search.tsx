import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { Search as SearchIcon } from 'lucide-react-native';
import { Note } from '@/types/note';
import { NoteStorage } from '@/services/noteStorage';
import NoteCard from '@/components/NoteCard';
import { Audio } from 'expo-av';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadAllNotes();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        const results = await NoteStorage.searchNotes(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadAllNotes = async () => {
    const notes = await NoteStorage.getAllNotes();
    setAllNotes(notes);
  };

  const handleEditNote = (note: Note) => {
    // For now, just show an alert as editing from search would require navigation
    console.log('Edit note:', note.id);
  };

  const handleDeleteNote = async (noteId: string) => {
    await NoteStorage.deleteNote(noteId);
    loadAllNotes();
    // Re-run search if there's an active query
    if (searchQuery.trim()) {
      const results = await NoteStorage.searchNotes(searchQuery);
      setSearchResults(results);
    }
  };

  const handlePlayAudio = async (audioUri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
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
      <SearchIcon size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {searchQuery.trim() 
          ? isSearching 
            ? 'Searching...' 
            : 'No notes found'
          : 'Search your notes'
        }
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery.trim()
          ? 'Try different keywords or check your spelling'
          : 'Enter keywords to find your notes'
        }
      </Text>
    </View>
  );

  const displayNotes = searchQuery.trim() ? searchResults : allNotes;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Notes</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <FlatList
        data={displayNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </View>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
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
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});