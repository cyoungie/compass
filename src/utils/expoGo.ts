import Constants from 'expo-constants';

/**
 * True when running inside Expo Go. Use to avoid loading native-only modules
 * that are not linked in Expo Go.
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}
