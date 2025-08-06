import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Square, Play, Pause } from 'lucide-react-native';

interface VoiceRecorderProps {
  onSave: (audioUri: string, duration: number) => void;
}

export default function VoiceRecorder({ onSave }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setDuration(0);
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  async function playRecording() {
    if (!recordedUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  }

  async function pauseRecording() {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }

  function saveRecording() {
    if (recordedUri && duration > 0) {
      onSave(recordedUri, duration);
      resetRecorder();
    }
  }

  function resetRecorder() {
    setRecordedUri(null);
    setDuration(0);
    setIsPlaying(false);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>
          {formatTime(duration)}
        </Text>
      </View>

      <View style={styles.controls}>
        {!recordedUri ? (
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingActive]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <Square size={32} color="#FFFFFF" />
            ) : (
              <Mic size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={isPlaying ? pauseRecording : playRecording}
            >
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {recordedUri && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.discardButton}
            onPress={resetRecorder}
          >
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveRecording}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timeDisplay: {
    marginBottom: 40,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    marginBottom: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  recordingActive: {
    backgroundColor: '#DC2626',
    transform: [{ scale: 1.1 }],
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 20,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  discardButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  discardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
});