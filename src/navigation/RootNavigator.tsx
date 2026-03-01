import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { AuthProvider, useAuth, isFirebaseConfigured } from '../context/AuthContext';
import type { RootStackParamList, OnboardingStackParamList } from '../types/navigation';
import { isExpoGo } from '../utils/expoGo';

import MainTabsWithChat from './MainTabsWithChat';
import SignInScreen from '../screens/auth/SignInScreen';
import WelcomeFormScreen from '../screens/onboarding/WelcomeFormScreen';
import SummaryScreen from '../screens/onboarding/SummaryScreen';

// Voice screen uses expo-speech-recognition (native); only load in dev builds, not Expo Go.
const VoiceOnboardingScreen = lazy(() =>
  Promise.resolve({ default: require('../screens/onboarding/VoiceOnboardingScreen').default })
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingFlow() {
  return (
    <Suspense fallback={null}>
      <OnboardingStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="WelcomeForm"
      >
        <OnboardingStack.Screen name="WelcomeForm" component={WelcomeFormScreen} />
        {!isExpoGo() && (
          <OnboardingStack.Screen name="VoiceOnboarding" component={VoiceOnboardingScreen} />
        )}
        <OnboardingStack.Screen name="Summary" component={SummaryScreen} />
      </OnboardingStack.Navigator>
    </Suspense>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Main" component={MainTabsWithChat} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, setUser, isLoading } = useProfile();

  if (isLoading) return null;

  return (
    <AuthProvider setUser={setUser}>
      {isFirebaseConfigured ? (
        <AuthStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
          <Stack.Screen name="Onboarding" component={OnboardingFlow} />
          <Stack.Screen name="Main" component={MainTabsWithChat} />
        </Stack.Navigator>
      )}
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ProfileProvider>
  );
}
