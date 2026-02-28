import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { AuthProvider, useAuth, isFirebaseConfigured } from '../context/AuthContext';
import type { RootStackParamList, OnboardingStackParamList } from '../types/navigation';

import MainTabsWithChat from './MainTabsWithChat';
import SignInScreen from '../screens/auth/SignInScreen';
import WelcomeFormScreen from '../screens/onboarding/WelcomeFormScreen';
import VoiceOnboardingScreen from '../screens/onboarding/VoiceOnboardingScreen';
import SummaryScreen from '../screens/onboarding/SummaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingFlow() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="WelcomeForm"
    >
      <OnboardingStack.Screen name="WelcomeForm" component={WelcomeFormScreen} />
      <OnboardingStack.Screen name="VoiceOnboarding" component={VoiceOnboardingScreen} />
      <OnboardingStack.Screen name="Summary" component={SummaryScreen} />
    </OnboardingStack.Navigator>
  );
}

function AuthStack() {
  const { authUser, profileLoading } = useAuth();
  if (profileLoading) return null;
  if (authUser) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabsWithChat} />
      </Stack.Navigator>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Main" component={MainTabsWithChat} />
          ) : (
            <Stack.Screen name="Onboarding" component={OnboardingFlow} />
          )}
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
