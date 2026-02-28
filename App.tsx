import React from 'react';
import { StatusBar } from 'expo-status-bar';
import App from './src/navigation/RootNavigator';

export default function Root() {
  return (
    <>
      <StatusBar style="dark" />
      <App />
    </>
  );
}
