import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { onAuthStateChange, logout as firebaseLogout } from '../services/firebase/auth';
import { getUserById, UserProfile } from '../services/firebase/firestore';
import { clearTokens } from '../utils/tokenManager';
import { SESSION_EXPIRED_EVENT } from '../services/api/config';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  setUserProfile: (profile: UserProfile | null) => void;
  refreshUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

// Milliseconds to wait before retrying a Firestore profile lookup.
// Accounts for the brief window between Firebase auth succeeding and the
// profile document being written to Firestore by the Login component.
const PROFILE_CREATION_RETRY_DELAY_MS = 1500;

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Tracks whether initial auth resolution is still in progress.
  // Used to suppress SESSION_EXPIRED_EVENT during the login flow.
  const isLoadingRef = useRef(true);

  const refreshUserProfile = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const profile = await getUserById(firebaseUser.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('[AuthContext] Failed to refresh user profile:', err);
    }
  }, [firebaseUser]);

  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      clearTokens();
      setFirebaseUser(null);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      // Suppress during initial auth resolution to avoid logging out mid-login
      if (isLoadingRef.current) return;
      setFirebaseUser(null);
      setUserProfile(null);
      navigate('/');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          let profile = await getUserById(user.uid);

          // Retry once after a short delay to handle the race condition where
          // a first-time user's profile hasn't been written to Firestore yet.
          if (!profile) {
            await new Promise((resolve) => setTimeout(resolve, PROFILE_CREATION_RETRY_DELAY_MS));
            profile = await getUserById(user.uid);
            if (!profile) {
              console.warn('[AuthContext] User profile not found after retry — may be a new user still setting up their profile.');
            }
          }

          setUserProfile(profile);
        } catch (err) {
          console.error('[AuthContext] Error loading user profile:', err);
          setError('Failed to load user profile.');
        }
      } else {
        setUserProfile(null);
        clearTokens();
      }

      isLoadingRef.current = false;
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    firebaseUser,
    userProfile,
    isAuthenticated: !!firebaseUser && !!userProfile,
    isLoading,
    error,
    setUserProfile,
    refreshUserProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an <AuthProvider>');
  }
  return ctx;
}
