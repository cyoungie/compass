import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '../../types/navigation';
import { FONT_HEADING, FONT_BODY, FONT_BODY_SEMIBOLD } from '../../constants/fonts';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: { navigation: Nav }) {
  const { signIn, createAccountWithProfile, authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    const e = email.trim();
    const p = password;
    if (!e || !p) return;
    clearError();
    if (isSignUp) {
      navigation.navigate('Onboarding');
      return;
    }
    setLoading(true);
    try {
      await signIn(e, p);
    } catch {
      // error shown in authError
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[ORANGE, CREAM]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Compass</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create an account to get started' : 'Sign in to continue'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            {authError ? (
              <Text style={styles.error}>{authError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create account' : 'Sign in'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switch}
              onPress={() => {
                setIsSignUp((v) => !v);
                clearError();
              }}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Create one"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  gradient: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontFamily: FONT_HEADING,
    fontSize: 32,
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_BODY,
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  input: {
    fontFamily: FONT_BODY,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  error: {
    fontFamily: FONT_BODY,
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 12,
  },
  button: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 17,
    color: '#fff',
  },
  switch: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#475569',
  },
});
