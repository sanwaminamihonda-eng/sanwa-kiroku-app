'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/types';
import { isDemo } from '@/lib/env';
import { onAuthChange, getCurrentDemoUser, signOut as authSignOut, signInAsGuest } from '@/lib/auth';
import { getUser } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // SSR/CSR の hydration mismatch を避けるため、初期値は常に null/true
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // デモモードの場合
    if (isDemo()) {
      // 非同期で状態更新（lint rule: set-state-in-effect 対応）
      const initDemo = async () => {
        const demoUser = getCurrentDemoUser();
        if (mounted) {
          if (demoUser) {
            setUser(demoUser);
          }
          setLoading(false);
        }
      };
      initDemo();
      return () => { mounted = false; };
    }

    // 本番モードの場合
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (!mounted) return;
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userData = await getUser(fbUser.uid);
        if (mounted) {
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const handleSignInAsGuest = async () => {
    const guestUser = await signInAsGuest();
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signOut: handleSignOut,
        signInAsGuest: handleSignInAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
