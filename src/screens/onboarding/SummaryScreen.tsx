import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import type { OnboardingFormData, StoredUser, UserProfile } from '../../types';
import { generateProfileFromTranscript } from '../../services/claude';
import { setStoredUser } from '../../services/storage';
import { useProfile } from '../../context/ProfileContext';
import { useAuth, isFirebaseConfigured } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Summary'>;
  route: { params: { form: OnboardingFormData; transcript: string } };
};

export default function SummaryScreen({ navigation, route }: Props) {
  const { form, transcript } = route.params;
  const { setUser } = useProfile();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [welcomeSummary, setWelcomeSummary] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

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
    if (isFirebaseConfigured && auth) {
      const e = email.trim();
      const p = password;
      if (!e || !p) {
        setError('Enter email and password to create your account');
        return;
      }
      setError(null);
      setCreateLoading(true);
      try {
        await auth.createAccountWithProfile(e, p, stored);
        setUser(stored);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : (auth.authError ?? 'Account creation failed');
        setError(msg);
      } finally {
        setCreateLoading(false);
      }
      return;
    }
    await setStoredUser(stored);
    setUser(stored);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Creating your profile...</Text>
      </View>
    );
  }

  if (error && !profile) {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Here’s your summary</Text>
      <View style={styles.card}>
        <Text style={styles.summary}>{welcomeSummary}</Text>
      </View>
        {isFirebaseConfigured && (
          <>
            <Text style={styles.createTitle}>Create your account</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!createLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!createLoading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        )}
        <TouchableOpacity
          style={[styles.button, createLoading && styles.buttonDisabled]}
          onPress={handleGetStarted}
          disabled={createLoading}
          activeOpacity={0.8}
        >
          {createLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isFirebaseConfigured ? 'Create account' : 'Get started'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.7 },
  center: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
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
