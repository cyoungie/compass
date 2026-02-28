import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { StoredUser } from '../types';
import { getStoredUser } from '../services/storage';

interface ProfileContextValue {
  user: StoredUser | null;
  setUser: (user: StoredUser | null) => void;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStoredUser().then((u) => {
      if (!cancelled) {
        setUserState(u);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setUser = useCallback((u: StoredUser | null) => {
    setUserState(u);
  }, []);

  return (
    <ProfileContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
