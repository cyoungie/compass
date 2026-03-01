/**
 * Anonymous sign-in and persisting UID to AsyncStorage.
 */
import { signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase';

const USER_ID_KEY = 'userId';

/**
 * Signs the user in anonymously and saves their UID to AsyncStorage under 'userId'.
 */
export async function signInAnonymously(): Promise<void> {
  const { user } = await firebaseSignInAnonymously(auth);
  await AsyncStorage.setItem(USER_ID_KEY, user.uid);
}
