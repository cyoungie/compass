import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingFormData, StoredUser, UserProfile } from '../../types';
import type { OnboardingStackParamList } from '../../types/navigation';
import { useProfile } from '../../context/ProfileContext';
import { setStoredUser } from '../../services/storage';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'WelcomeForm'>;
};

function defaultProfile(form: OnboardingFormData): UserProfile {
  return {
    housing_status: 'Unknown',
    has_id: false,
    has_healthcare: false,
    education_level: 'Unknown',
    food_secure: false,
    wellbeing_score: 3,
    zip_code: form.zipCode,
    state: 'California',
    legal_gaps: ['State ID', 'Healthcare coverage'],
  };
}

export default function WelcomeFormScreen({ navigation }: Props) {
  const { setUser } = useProfile();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleContinue = async () => {
    const trimmedName = name.trim();
    const trimmedZip = zipCode.trim();
    if (!trimmedName) {
      Alert.alert('Missing info', 'Please enter your name.');
      return;
    }
    if (!trimmedZip) {
      Alert.alert('Missing info', 'Please enter your zip code.');
      return;
    }
    const form: OnboardingFormData = {
      name: trimmedName,
      birthday: birthday.trim() || '',
      zipCode: trimmedZip,
    };
    const profile = defaultProfile(form);
    const stored: StoredUser = {
      form,
      profile,
      welcomeSummary: `Welcome, ${trimmedName}. We're here to help you with next steps—from getting your ID to finding resources near you. You can explore your priorities on the Home tab and use the chat anytime.`,
      onboardingCompletedAt: new Date().toISOString(),
    };
    await setStoredUser(stored);
    setUser(stored);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Compass</Text>
        <Text style={styles.subtitle}>A few details to get started</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Birthday (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#64748b"
          value={birthday}
          onChangeText={setBirthday}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Zip code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 90210"
          placeholderTextColor="#64748b"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="number-pad"
          maxLength={10}
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f1f5f9',
    marginBottom: 20,
  },
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
