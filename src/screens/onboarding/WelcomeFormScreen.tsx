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
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingFormData } from '../../types';
import type { OnboardingStackParamList } from '../../types/navigation';
import { config } from '../../constants/config';
import { FONT_HEADING, FONT_BODY, FONT_BODY_MEDIUM, FONT_BODY_SEMIBOLD } from '../../constants/fonts';
import { isFirebaseConfigured } from '../../context/AuthContext';
import { isExpoGo } from '../../utils/expoGo';

const COLORS = {
  start: '#E68D33',
  end: '#FFE6B3',
};

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'WelcomeForm'>;
};

type SlideIndex = 0 | 1 | 2;

export default function WelcomeFormScreen({ navigation }: Props) {
  const [slide, setSlide] = useState<SlideIndex>(0);
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [zipCode, setZipCode] = useState('');

  const buildForm = (): OnboardingFormData => ({
    name: nickname.trim(),
    birthday: '',
    zipCode: zipCode.trim(),
    age: age.trim() || undefined,
  });

  const buildTranscript = (): string => {
    const form = buildForm();
    return `Onboarding form. Nickname (alias): ${form.name}.${form.age ? ` Age: ${form.age}.` : ''} Zip code: ${form.zipCode}. Use these details to infer a supportive profile and welcome summary.`;
  };

  const goNext = () => {
    if (slide === 0) {
      if (!nickname.trim()) {
        Alert.alert('Quick question', 'What should we call you? A nickname or alias is fine.');
        return;
      }
      setSlide(1);
    } else if (slide === 1) {
      if (!age.trim()) {
        Alert.alert('Quick question', 'How old are you? (Just your age is enough.)');
        return;
      }
      setSlide(2);
    }
  };

  const handleContinue = () => {
    const trimmedZip = zipCode.trim();
    if (!trimmedZip) {
      Alert.alert('Almost there', 'Please enter your zip code so we can show you local resources.');
      return;
    }
    const form = buildForm();
    form.zipCode = trimmedZip;
    navigation.navigate('Summary', { form, transcript: buildTranscript() });
  };

  const handleContinueWithVoice = () => {
    const trimmedZip = zipCode.trim();
    if (!trimmedZip) {
      Alert.alert('Almost there', 'Please enter your zip code first.');
      return;
    }
    const form = buildForm();
    form.zipCode = trimmedZip;
    navigation.navigate('VoiceOnboarding', { form });
  };

  const isLastSlide = slide === 2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[COLORS.start, COLORS.end]}
        style={StyleSheet.absoluteFill}
      />
      {isFirebaseConfigured && (
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('SignIn')}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.signInHeaderText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress dots */}
      <View style={styles.dots}>
        {([0, 1, 2] as const).map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === slide && styles.dotActive,
              i < slide && styles.dotDone,
            ]}
          />
        ))}
      </View>

      <View style={styles.slideContent}>
        {/* Slide 0: Nickname */}
        {slide === 0 && (
          <>
            <View style={styles.copyBlock}>
              <Text style={styles.welcomeTitle}>Welcome to Compass</Text>
              <Text style={styles.welcomeBody}>
                We’re here to help you navigate what’s next. To keep things safe and private, we only need a nickname or alias—whatever you’re comfortable with.
              </Text>
            </View>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>What should we call you?</Text>
              <TextInput
                style={styles.input}
                placeholder="Nickname or alias"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="words"
                autoFocus
              />
              <TouchableOpacity style={styles.button} onPress={goNext} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Slide 1: Age */}
        {slide === 1 && (
          <>
            <View style={styles.copyBlock}>
              <Text style={styles.welcomeTitle}>A quick detail</Text>
              <Text style={styles.welcomeBody}>
                Your age helps us point you to the right resources and programs. We don’t need your birthday—just how old you are.
              </Text>
            </View>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>How old are you?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 17"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
                autoFocus
              />
              <TouchableOpacity style={styles.button} onPress={goNext} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Slide 2: Zip code */}
        {slide === 2 && (
          <>
            <View style={styles.copyBlock}>
              <Text style={styles.welcomeTitle}>Almost there</Text>
              <Text style={styles.welcomeBody}>
                Your zip code lets us find housing, food, healthcare, and other support near you. Everything stays private.
              </Text>
            </View>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>What’s your zip code?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 90210"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="number-pad"
                maxLength={10}
                autoFocus
              />
              <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
              {!isExpoGo() && (
                <TouchableOpacity style={styles.voiceButton} onPress={handleContinueWithVoice} activeOpacity={0.8}>
                  <Text style={styles.voiceButtonText}>Continue with voice (optional)</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {slide > 0 && (
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => setSlide((s) => (s - 1) as SlideIndex)}
          activeOpacity={0.8}
        >
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>
      )}

      {__DEV__ && (
        <Text style={styles.debug}>
          Firebase: {isFirebaseConfigured ? 'on' : 'off'}
          {!isFirebaseConfigured && config.firebaseApiKey ? ' (keys set)' : ''}
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  headerSpacer: { width: 60 },
  signInHeaderText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 16,
    color: 'rgba(0,0,0,0.75)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
  },
  dotDone: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  copyBlock: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontFamily: FONT_HEADING,
    fontSize: 26,
    color: 'rgba(0,0,0,0.85)',
    marginBottom: 14,
  },
  welcomeBody: {
    fontFamily: FONT_BODY,
    fontSize: 17,
    lineHeight: 24,
    color: 'rgba(0,0,0,0.75)',
  },
  inputBlock: {
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
  },
  label: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 15,
    color: 'rgba(0,0,0,0.8)',
    marginBottom: 10,
  },
  input: {
    fontFamily: FONT_BODY,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    color: '#0f172a',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 17,
    color: '#fff',
  },
  voiceButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  voiceButtonText: {
    fontFamily: FONT_BODY_MEDIUM,
    fontSize: 15,
    color: 'rgba(0,0,0,0.7)',
  },
  backLink: {
    position: 'absolute',
    bottom: 32,
    left: 24,
  },
  backLinkText: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: 'rgba(0,0,0,0.65)',
  },
  debug: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
  },
});
