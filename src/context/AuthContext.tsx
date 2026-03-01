import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { getUserProfile, setUserProfile } from '../services/firestore';
import { getAuthErrorMessage } from '../utils/authErrors';
import type { StoredUser } from '../types';

interface AuthContextValue {
  authUser: User | null;
  profileLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createAccountWithProfile: (email: string, password: string, profile: StoredUser) => Promise<void>;
  updateProfile: (profile: StoredUser) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const noopAuth: AuthContextValue = {
  authUser: null,
  profileLoading: false,
  authError: null,
  signIn: async () => {},
  signOut: async () => {},
  createAccountWithProfile: async () => {},
  updateProfile: async () => {},
  clearError: () => {},
};

export function AuthProvider({
  children,
  setUser,
}: {
  children: React.ReactNode;
  setUser: (u: StoredUser | null) => void;
}) {
  if (!isFirebaseConfigured) {
    return <AuthContext.Provider value={noopAuth}>{children}</AuthContext.Provider>;
  }
  return <AuthProviderInner setUser={setUser}>{children}</AuthProviderInner>;
}

function AuthProviderInner({
  children,
  setUser,
}: {
  children: React.ReactNode;
  setUser: (u: StoredUser | null) => void;
}) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setProfileLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        setProfileLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          setUser(profile ?? null);
        } catch {
          setUser(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUser(null);
        setProfileLoading(false);
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      const message = getAuthErrorMessage(e, 'Sign in failed');
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    await firebaseSignOut(auth);
    setUser(null);
  }, [setUser]);

  const createAccountWithProfile = useCallback(
    async (email: string, password: string, profile: StoredUser) => {
      setAuthError(null);
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setUserProfile(user.uid, profile);
        setUser(profile);
      } catch (e: unknown) {
        const message = getAuthErrorMessage(e, 'Account creation failed');
        setAuthError(message);
        throw new Error(message);
      }
    },
    [setUser]
  );

  const updateProfile = useCallback(
    async (profile: StoredUser) => {
      if (!authUser) return;
      await setUserProfile(authUser.uid, profile);
      setUser(profile);
    },
    [authUser, setUser]
  );

  const clearError = useCallback(() => setAuthError(null), []);

  const value: AuthContextValue = {
    authUser,
    profileLoading,
    authError,
    signIn,
    signOut,
    createAccountWithProfile,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { isFirebaseConfigured };
