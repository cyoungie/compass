/**
 * Maps Firebase Auth error codes to user-friendly messages
 * so users (and devs) know how to fix (e.g. enable Email/Password in Console).
 */
const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  'auth/operation-not-allowed':
    'Email/password sign-in is not enabled. In Firebase Console go to Authentication → Sign-in method → enable Email/Password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'This email is already registered. Sign in or use a different email.',
  'auth/weak-password': 'Please choose a password with at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Wrong password. Try again or reset your password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/invalid-credential': 'Invalid email or password.',
};

export function getAuthErrorMessage(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!e || typeof e !== 'object') return fallback;
  const code = 'code' in e && typeof (e as { code: string }).code === 'string' ? (e as { code: string }).code : '';
  const message = FIREBASE_AUTH_MESSAGES[code];
  if (message) return message;
  const msg = 'message' in e && typeof (e as { message: string }).message === 'string' ? (e as { message: string }).message : '';
  return msg || fallback;
}
