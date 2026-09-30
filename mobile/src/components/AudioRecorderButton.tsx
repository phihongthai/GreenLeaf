import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  useAudioRecorder,
  IOSOutputFormat,
  AudioQuality,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type RecordingOptions,
} from 'expo-audio';
import { Mic, Square } from 'lucide-react-native';
import { THEME } from '../lib/theme';

export const AZURE_WAV_RECORDING_PRESET: RecordingOptions = {
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  android: {
    extension: '.wav',
    outputFormat: 'default',
    audioEncoder: 'default',
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    sampleRate: 16000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 256000,
  },
};

interface AudioRecorderButtonProps {
  onRecordingFinished: (uri: string) => void;
  busy?: boolean;
}

export default function AudioRecorderButton({ onRecordingFinished, busy = false }: AudioRecorderButtonProps) {
  const [recording, setRecording] = useState(false);
  const recorder = useAudioRecorder(AZURE_WAV_RECORDING_PRESET);

  const handleToggle = async () => {
    if (busy) return;

    if (!recording) {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Microphone Permission',
          'GreenLeaf needs access to your microphone to practice pronunciation. Please enable it in Settings.'
        );
        return;
      }

      try {
        // Enable iOS recording session
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        await recorder.prepareToRecordAsync(AZURE_WAV_RECORDING_PRESET);
        recorder.record();
        setRecording(true);
      } catch (err) {
        console.warn('Failed to start recording:', err);
      }
    } else {
      try {
        await recorder.stop();
        setRecording(false);

        // Reset iOS recording session so audio playback is clear and loud
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });

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
