import React, { Suspense, lazy } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import type { OnboardingFormData } from '../../types';
import { isExpoGo } from '../../utils/expoGo';

type Props = {
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

const VoiceOnboardingNativeScreen = lazy(
  () => import('./VoiceOnboardingNativeScreen')
);

/**
 * In Expo Go, native modules (@livekit/react-native) are not linked, so we never
 * load VoiceOnboardingNativeScreen and use a mock flow instead. In a dev build
 * (expo run:ios), we load the real ElevenLabs voice screen.
 */
function VoiceOnboardingScreen(props: Props) {
  if (isExpoGo()) {
    return <MockVoiceOnboarding {...props} />;
  }
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VoiceOnboardingNativeScreen {...props} />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7dd3fc" style={styles.loader} />
      <Text style={styles.subtitle}>Loading voice onboarding...</Text>
    </View>
  );
}

function MockVoiceOnboarding({ navigation, route }: Props) {
  const { form } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice onboarding</Text>
      <Text style={styles.subtitle}>
        You're in Expo Go — real voice isn't available here. Tap below to continue with a sample
        transcript so you can try the rest of the app.
      </Text>
      <Text style={styles.fallback}>
        For real voice, build the app: npx expo run:ios
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Summary', { form, transcript: MOCK_TRANSCRIPT })}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Continue with sample →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 24,
  },
  fallback: {
    fontSize: 14,
    color: '#fbbf24',
    marginBottom: 24,
  },
  loader: { marginVertical: 24 },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});

export default VoiceOnboardingScreen;
