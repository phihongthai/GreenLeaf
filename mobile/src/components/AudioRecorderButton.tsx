import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import { Mic, Square } from 'lucide-react-native';
import { THEME } from '../lib/theme';

interface AudioRecorderButtonProps {
  onRecordingFinished: (uri: string) => void;
  busy?: boolean;
}

export default function AudioRecorderButton({ onRecordingFinished, busy = false }: AudioRecorderButtonProps) {
  const [recording, setRecording] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const handleToggle = async () => {
    if (busy) return;

    if (!recording) {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission not granted');
        return;
      }

      try {
        await recorder.prepareToRecordAsync();
        recorder.record();
        setRecording(true);
      } catch (err) {
        console.warn('Failed to start recording:', err);
      }
    } else {
      try {
        await recorder.stop();
        setRecording(false);
        if (recorder.uri) {
          onRecordingFinished(recorder.uri);
        }
      } catch (err) {
        console.warn('Failed to stop recording:', err);
        setRecording(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, recording && styles.btnRecording, busy && styles.btnBusy]}
        onPress={handleToggle}
        disabled={busy}
        activeOpacity={0.8}
      >
        {busy ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
        ) : recording ? (
          <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Mic size={32} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>
        {busy ? 'Scoring your voice with AI...' : recording ? 'Recording... Tap when done' : 'Tap to Practice Speaking'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  btn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnRecording: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  btnBusy: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
});
