import { useState, useCallback } from 'react';
import { sendPhoneOtp, verifyPhoneOtp, signInWithGoogle, createOrUpdateUserProfile, getIdToken } from '../services/firebase/auth';
import { authService } from '../services/api/services/authService';
import { useAuthContext } from '../context/AuthContext';
import { UserProfile } from '../services/firebase/firestore';

// ── useLogin ──────────────────────────────────────────────────────────────────

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = useCallback(
    async (phone: string, containerId?: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await sendPhoneOtp(phone, containerId);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send OTP.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithGoogle();
      const idToken = await credential.user.getIdToken();
      await authService.googleLogin(idToken);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendOtp, loginWithGoogle, loading, error, setError };
}

// ── useVerifyOtp ──────────────────────────────────────────────────────────────

export function useVerifyOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOtp = useCallback(
    async (
      otp: string,
      role: 'advertiser' | 'owner'
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const credential = await verifyPhoneOtp(otp);
        const user = credential.user;
        const idToken = await getIdToken();

        if (!idToken) throw new Error('Failed to obtain Firebase token.');

        await authService.verifyOtp({
          phone: user.phoneNumber ?? '',
          otp,
          firebaseUid: user.uid,
          role,
        });

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OTP verification failed.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { verifyOtp, loading, error, setError };
}

// ── useLogout ─────────────────────────────────────────────────────────────────

export function useLogout() {
  const { logout } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return { logout: handleLogout, loading };
}

// ── useCurrentUser ────────────────────────────────────────────────────────────

export function useCurrentUser(): {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} {
  const { userProfile, isAuthenticated, isLoading } = useAuthContext();
  return { user: userProfile, isAuthenticated, isLoading };
}

// ── useCompleteProfile ────────────────────────────────────────────────────────

export function useCompleteProfile() {
  const { refreshUserProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeProfile = useCallback(
    async (
      displayName: string,
      role: 'advertiser' | 'owner' | 'admin',
      email?: string
    ): Promise<boolean> => {
      const { auth } = await import('../config/firebase');
      const user = auth.currentUser;
      if (!user) {
        setError('No authenticated user found.');
        return false;
      }
      setLoading(true);
      setError(null);
      try {
        await createOrUpdateUserProfile(user, displayName, role, email);
        await refreshUserProfile();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save profile.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshUserProfile]
  );

  return { completeProfile, loading, error, setError };
}
