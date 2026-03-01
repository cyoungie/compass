import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredUser } from '../types';
import { STORAGE_KEYS } from '../constants';

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

const ANONYMOUS_USER_ID_KEY = 'userId';

/**
 * Clears all app storage used for user identity so the app can show onboarding again.
 * Call after signOut() when you want to "start from beginning".
 */
export async function clearAppIdentityStorage(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.USER),
    AsyncStorage.removeItem(ANONYMOUS_USER_ID_KEY),
  ]);
}
