import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import type { OnboardingFormData, StoredUser, UserProfile } from '../../types';
import { generateProfileFromTranscript } from '../../services/claude';
import { setStoredUser } from '../../services/storage';
import { useProfile } from '../../context/ProfileContext';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Summary'>;
  route: { params: { form: OnboardingFormData; transcript: string } };
};

export default function SummaryScreen({ navigation, route }: Props) {
  const { form, transcript } = route.params;
  const { setUser } = useProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [welcomeSummary, setWelcomeSummary] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateProfileFromTranscript(transcript)
      .then(({ profile: p, welcomeSummary: s }) => {
        if (!cancelled) {
          setProfile(p);
          setWelcomeSummary(s);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Something went wrong');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [transcript]);

  const handleGetStarted = async () => {
    if (!profile) return;
    const stored: StoredUser = {
      form,
      transcript,
      profile,
      welcomeSummary,
      onboardingCompletedAt: new Date().toISOString(),
    };
    await setStoredUser(stored);
    setUser(stored);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7dd3fc" />
        <Text style={styles.loadingText}>Creating your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Here’s your summary</Text>
      <View style={styles.card}>
        <Text style={styles.summary}>{welcomeSummary}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Get started</Text>
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
  center: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e2e8f0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 16,
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
