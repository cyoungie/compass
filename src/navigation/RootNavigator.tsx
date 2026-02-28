import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import type { RootStackParamList, OnboardingStackParamList } from '../types/navigation';

// Main (includes tabs + floating chat)
import MainTabsWithChat from './MainTabsWithChat';

// Onboarding
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

function RootNavigator() {
  const { user, isLoading } = useProfile();

  if (isLoading) {
    return null; // or a small splash
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabsWithChat} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      )}
    </Stack.Navigator>
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
