/**
 * Voice onboarding using ElevenLabs + LiveKit. Only loaded in development builds;
 * do not import this file from Expo Go (native modules are not linked there).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import type { OnboardingFormData } from '../../types';
import { ElevenLabsProvider, useConversation } from '@elevenlabs/react-native';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import { config } from '../../constants/config';

export type VoiceOnboardingNativeProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'VoiceOnboarding'>;
  route: { params: { form: OnboardingFormData } };
};

const MOCK_TRANSCRIPT = [
  'Agent: What is your current housing situation?',
  'User: I have a place with a friend for now.',
  'Agent: Do you have a state ID or important documents?',
  'User: I have my birth certificate but no state ID yet.',
  'Agent: Do you have healthcare coverage?',
  'User: Yes, Medicaid.',
  'Agent: What is your education or employment situation?',
  'User: I finished high school and I am looking for a job.',
  'Agent: Are you aware you can stay in extended foster care until 21 in California?',
  'User: Yes.',
  'Agent: How is your food security?',
  'User: Sometimes I skip meals but mostly okay.',
  'Agent: On a scale of 1 to 5, how is your mental wellbeing?',
  'User: 3.',
  'Agent: Who is in your support network?',
  'User: My former foster mom and a friend.',
].join('\n');

function VoiceOnboardingContent({ navigation, route }: VoiceOnboardingNativeProps) {
  const { form } = route.params;
  const [transcript, setTranscript] = useState<string[]>([]);
  const transcriptRef = useRef<string[]>([]);
  const agentId = config.elevenLabsAgentId;

  // Log agentId so you can confirm it's read correctly (check Metro/Xcode console)
  useEffect(() => {
    const id = config.elevenLabsAgentId;
    if (id) {
      console.log('[ElevenLabs] agentId loaded:', `${id.slice(0, 8)}...`);
    } else {
      console.log('[ElevenLabs] No agent ID in .env — using sample flow. Add EXPO_PUBLIC_ELEVENLABS_AGENT_ID to .env and restart Metro for real voice.');
    }
  }, []);

  const appendTranscript = useCallback((message: string, source: string) => {
    const line = source === 'user' ? `User: ${message}` : `Agent: ${message}`;
    transcriptRef.current = [...transcriptRef.current, line];
    setTranscript(transcriptRef.current);
  }, []);

  const conversation = useConversation({
    onMessage: (props: { message: string; source?: string }) => {
      appendTranscript(props.message, (props as { source?: string }).source ?? 'agent');
    },
    onConnect: () => {
      console.log('[ElevenLabs] Connected to voice session');
    },
    onDisconnect: () => {
      console.log('[ElevenLabs] Disconnected from voice session');
    },
    onError: (err) => console.warn('[ElevenLabs] error:', err),
  });

  const handleStart = async () => {
    const id = config.elevenLabsAgentId;
    console.log('[ElevenLabs] handleStart — agentId:', id ? `${id.slice(0, 12)}...` : '(empty)');

    if (!id) {
      navigation.replace('Summary', { form, transcript: MOCK_TRANSCRIPT });
      return;
    }

    try {
      // Request microphone permission before ElevenLabs connects
      const { granted, status } = await requestRecordingPermissionsAsync();
      console.log('[ElevenLabs] Microphone permission:', { granted, status });
      if (!granted) {
        Alert.alert(
          'Microphone access',
          'Voice onboarding needs microphone access. Enable it in Settings to use the voice conversation.',
          [
            { text: 'Use sample instead', onPress: () => navigation.replace('Summary', { form, transcript: MOCK_TRANSCRIPT }) },
            { text: 'OK' },
          ]
        );
        return;
      }

      await conversation.startSession({ agentId: id });
    } catch (e) {
      console.error('[ElevenLabs] startSession error:', e);
      navigation.replace('Summary', {
        form,
        transcript: 'User shared their situation. Housing: unknown. ID: no. Healthcare: yes. Education: high school. Food: sometimes. Wellbeing: 3. Support: yes.',
      });
    }
  };

  const handleFinish = async () => {
    try {
      await conversation.endSession();
    } catch (_) {}
    const fullTranscript = transcriptRef.current.join('\n');
    navigation.replace('Summary', { form, transcript: fullTranscript || 'No transcript captured.' });
  };

  const status = conversation.status;
  const isConnected = status === 'connected';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice onboarding</Text>
      <Text style={styles.subtitle}>
        An AI voice will ask you 8 short questions. Answer at your own pace.
      </Text>
      {!agentId && (
        <>
          <Text style={styles.fallback}>No voice agent configured. You'll go through with a sample flow.</Text>
          <Text style={styles.debugHint}>
            Add EXPO_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id to the .env file in the project root (same folder as package.json). Then restart Metro (stop it and run npx expo start again) and reload the app.
          </Text>
        </>
      )}
      {status === 'connecting' && (
        <ActivityIndicator size="large" color="#7dd3fc" style={styles.loader} />
      )}
      {!isConnected && status !== 'connecting' && (
        <TouchableOpacity style={styles.button} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Start voice conversation</Text>
        </TouchableOpacity>
      )}
      {isConnected && (
        <>
          <View style={styles.transcriptBox}>
            {transcript.length > 0
              ? transcript.map((line, i) => (
                  <Text key={i} style={styles.transcriptLine}>
                    {line}
                  </Text>
                ))
              : (
                <Text style={styles.transcriptPlaceholder}>Conversation will appear here...</Text>
              )}
          </View>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish} activeOpacity={0.8}>
            <Text style={styles.buttonText}>I'm done — continue</Text>
          </TouchableOpacity>
        </>
      )}
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
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', marginBottom: 24 },
  fallback: { fontSize: 14, color: '#b45309', marginBottom: 16 },
  debugHint: { fontSize: 12, color: '#64748b', marginHorizontal: 16, marginBottom: 16 },
  loader: { marginVertical: 24 },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  finishButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  transcriptBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    maxHeight: 360,
  },
  transcriptLine: { fontSize: 14, color: '#334155', marginBottom: 6 },
  transcriptPlaceholder: { fontSize: 14, color: '#64748b' },
});

export default function VoiceOnboardingNativeScreen(props: VoiceOnboardingNativeProps) {
  return (
    <ElevenLabsProvider audioSessionConfig={{ allowMixingWithOthers: false }}>
      <VoiceOnboardingContent {...props} />
    </ElevenLabsProvider>
  );
}
