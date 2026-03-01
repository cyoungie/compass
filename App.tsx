import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import App from './src/navigation/RootNavigator';

export default function Root() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E68D33" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (fontError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Failed to load fonts. Please restart the app.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <App />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE6B3',
  },
  loadingText: {
    fontFamily: 'DMSans_400Regular',
    marginTop: 12,
    fontSize: 16,
    color: 'rgba(0,0,0,0.6)',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
