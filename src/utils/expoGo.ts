import Constants from 'expo-constants';

/**
 * True when running inside Expo Go. Use to avoid loading native-only modules
 * (e.g. @livekit/react-native / @elevenlabs/react-native) which are not linked in Expo Go.
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}
