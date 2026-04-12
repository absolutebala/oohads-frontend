import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { onAuthStateChange, logout as firebaseLogout } from '../services/firebase/auth';
import { getUserById, UserProfile } from '../services/firebase/firestore';
import { authService } from '../services/api/services/authService';
import { clearTokens, hasValidToken } from '../utils/tokenManager';
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

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      await authService.logout();
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
          const profile = await getUserById(user.uid);
          setUserProfile(profile);

          // If no backend tokens, attempt a silent refresh
          if (!hasValidToken()) {
            try {
              await authService.refreshToken('');
            } catch {
              // Silent failure – user may need to re-authenticate
            }
          }
        } catch (err) {
          console.error('[AuthContext] Error loading user profile:', err);
          setError('Failed to load user profile.');
        }
      } else {
        setUserProfile(null);
        clearTokens();
      }

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
