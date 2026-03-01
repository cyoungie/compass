/**
 * Optional voice onboarding: user speaks, we capture with speech-to-text,
 * then send the transcript to Claude for profile + welcome summary.
 * Voice is not available in Expo Go; use a dev build (npx expo run:ios).
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import type { OnboardingFormData } from '../../types';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { isExpoGo } from '../../utils/expoGo';
import { FONT_HEADING, FONT_BODY, FONT_BODY_SEMIBOLD } from '../../constants/fonts';

export type VoiceOnboardingProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'VoiceOnboarding'>;
  route: { params: { form: OnboardingFormData } };
};

function formToTranscriptPrefix(form: OnboardingFormData): string {
  return `Onboarding form. Nickname: ${form.name}.${form.age ? ` Age: ${form.age}.` : ''} Zip code: ${form.zipCode}`;
}

export default function VoiceOnboardingScreen({ navigation, route }: VoiceOnboardingProps) {
  const { form } = route.params;
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionChecking, setPermissionChecking] = useState(false);
  const transcriptRef = useRef('');

  // In Expo Go, speech recognition isn't available; redirect to Summary with form-only.
  useEffect(() => {
    if (isExpoGo()) {
      const prefix = formToTranscriptPrefix(form);
      navigation.replace('Summary', {
        form,
        transcript: `${prefix} Use these details to infer a supportive profile and welcome summary.`,
      });
    }
  }, [form, navigation]);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event: { results: Array<{ transcript?: string }>; isFinal?: boolean }) => {
    const results = event?.results;
    if (results?.length) {
      const last = results[results.length - 1];
      const text = last?.transcript?.trim();
      if (text) {
        transcriptRef.current = transcriptRef.current ? `${transcriptRef.current} ${text}` : text;
        setTranscript(transcriptRef.current);
      }
    }
  });
  useSpeechRecognitionEvent('error', (event: { error?: string; message?: string }) => {
    if (event?.error === 'not-allowed') {
      Alert.alert(
        'Permission needed',
        'Microphone and speech recognition are needed to listen. Enable them in Settings to use voice.',
        [{ text: 'OK' }]
      );
    }
  });

  const handleStart = useCallback(async () => {
    setPermissionChecking(true);
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert(
          'Permission needed',
          'Compass needs microphone and speech recognition access so you can tell your story in your own words.',
          [{ text: 'OK' }]
        );
        return;
      }
      transcriptRef.current = '';
      setTranscript('');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
      });
    } finally {
      setPermissionChecking(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const handleSkip = useCallback(() => {
    const prefix = formToTranscriptPrefix(form);
    navigation.replace('Summary', {
      form,
      transcript: `${prefix} Use these details to infer a supportive profile and welcome summary.`,
    });
  }, [form, navigation]);

  const handleDone = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    const prefix = formToTranscriptPrefix(form);
    const fullTranscript = transcript.trim()
      ? `${prefix}\n\nVoice:\n${transcript.trim()}`
      : `${prefix} Use these details to infer a supportive profile and welcome summary.`;
    navigation.replace('Summary', { form, transcript: fullTranscript });
  }, [form, transcript, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us in your own words</Text>
      <Text style={styles.subtitle}>
        Optional: tap the mic and talk about your housing, school, how you're doing, or anything you want us to know. Claude will use this to personalize your profile.
      </Text>

      {permissionChecking && (
        <ActivityIndicator size="small" color="#0ea5e9" style={styles.loader} />
      )}

      {!recognizing && !permissionChecking && (
        <TouchableOpacity style={styles.micButton} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.micEmoji}>🎤</Text>
          <Text style={styles.micLabel}>Start listening</Text>
        </TouchableOpacity>
      )}

      {recognizing && (
        <>
          <TouchableOpacity style={[styles.micButton, styles.stopButton]} onPress={handleStop} activeOpacity={0.8}>
            <Text style={styles.micEmoji}>⏹</Text>
            <Text style={styles.micLabel}>Stop listening</Text>
          </TouchableOpacity>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Listening…</Text>
          </View>
        </>
      )}

      {transcript.length > 0 && (
        <ScrollView style={styles.transcriptBox} contentContainerStyle={styles.transcriptContent}>
          <Text style={styles.transcriptLabel}>What we heard:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </ScrollView>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Done → Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipLink} onPress={handleSkip} activeOpacity={0.8}>
          <Text style={styles.skipText}>Skip voice and use form only</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontFamily: FONT_HEADING,
    fontSize: 26,
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_BODY,
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },
  loader: { marginBottom: 16 },
  micButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  stopButton: { backgroundColor: '#dc2626' },
  micEmoji: { fontSize: 36, marginBottom: 8 },
  micLabel: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 17, color: '#fff' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  liveText: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 14, color: '#22c55e' },
  transcriptBox: {
    flex: 1,
    maxHeight: 220,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 24,
  },
  transcriptContent: { padding: 16 },
  transcriptLabel: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 12, color: '#64748b', marginBottom: 8 },
  transcriptText: { fontFamily: FONT_BODY, fontSize: 15, color: '#334155', lineHeight: 22 },
  actions: { marginTop: 'auto', paddingBottom: 40 },
  doneButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 17, color: '#fff' },
  skipLink: { alignItems: 'center' },
  skipText: { fontFamily: FONT_BODY, fontSize: 15, color: '#64748b' },
});
