import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
  UserCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { createUserProfile, getUserById, updateUserProfile } from './firestore';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

// ── Phone Authentication ──────────────────────────────────────────────────────

/**
 * Send OTP to phone number via Firebase Phone Auth.
 * Sets up invisible reCAPTCHA on the given container element id.
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> {
  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {},
      });
    }
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error: unknown) {
    clearRecaptcha();
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Verify the OTP entered by the user.
 */
export async function verifyPhoneOtp(otp: string): Promise<UserCredential> {
  if (!window.confirmationResult) {
    throw new Error('No OTP request in progress. Please request OTP first.');
  }
  try {
    const credential = await window.confirmationResult.confirm(otp);
    return credential;
  } catch (error: unknown) {
    throw mapFirebaseAuthError(error);
  }
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * Sign in with Google popup.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const credential = await signInWithPopup(auth, provider);
    return credential;
  } catch (error: unknown) {
    throw mapFirebaseAuthError(error);
  }
}

// ── Profile Management ────────────────────────────────────────────────────────

/**
 * Create or update user profile in Firebase Auth and Firestore.
 */
export async function createOrUpdateUserProfile(
  user: User,
  displayName: string,
  role: 'advertiser' | 'owner' | 'admin',
  email?: string
): Promise<void> {
  try {
    await updateProfile(user, { displayName });

    const profileData = {
      id: user.uid,
      name: displayName,
      phone: user.phoneNumber ?? '',
      email: email ?? user.email ?? '',
      role,
      createdAt: new Date().toISOString(),
    };

    const existing = await getUserById(user.uid);
    if (existing) {
      await updateUserProfile(user.uid, { name: displayName, email: profileData.email });
    } else {
      await createUserProfile(profileData);
    }
  } catch (error: unknown) {
    throw mapFirebaseAuthError(error);
  }
}

// ── Session ───────────────────────────────────────────────────────────────────

/**
 * Get the current Firebase ID token.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(/* forceRefresh */ false);
  } catch {
    return null;
  }
}

/**
 * Force refresh the Firebase ID token.
 */
export async function refreshIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(/* forceRefresh */ true);
  } catch {
    return null;
  }
}

/**
 * Subscribe to auth state changes.
 * Returns a no-op unsubscribe if Firebase auth is not properly initialized.
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  try {
    if (!auth || !('onAuthStateChanged' in auth)) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  } catch {
    callback(null);
    return () => {};
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * Sign out the current user from Firebase and clear local state.
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
    clearRecaptcha();
  } catch (error: unknown) {
    throw mapFirebaseAuthError(error);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clearRecaptcha() {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = undefined;
  }
  window.confirmationResult = undefined;
}

interface FirebaseError {
  code?: string;
  message?: string;
}

function isFirebaseError(error: unknown): error is FirebaseError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-phone-number': 'Invalid phone number. Use format: +91XXXXXXXXXX',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/invalid-verification-code': 'Incorrect OTP. Please check and retry.',
  'auth/code-expired': 'OTP expired. Please request a new one.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/cancelled-popup-request': 'Another sign-in is already in progress.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/network-request-failed': 'Network error. Check your internet connection.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
};

function mapFirebaseAuthError(error: unknown): Error {
  if (isFirebaseError(error) && error.code) {
    const message = AUTH_ERROR_MESSAGES[error.code] ?? error.message ?? 'Authentication failed.';
    return new Error(message);
  }
  if (error instanceof Error) return error;
  return new Error('An unexpected authentication error occurred.');
}
