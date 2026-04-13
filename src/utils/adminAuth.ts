const ADMIN_CREDS_KEY = 'adride_admin_creds';
const ADMIN_SESSION_KEY = 'adride_admin_session';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'AdminMaster@2024';

// PBKDF2 iterations – high enough to slow brute-force, low enough for UX
const PBKDF2_ITERATIONS = 100_000;

interface AdminCreds {
  username: string;
  passwordHash: string; // base64-encoded
  salt: string;         // base64-encoded
}

interface AdminSession {
  expiresAt: number;
}

// ── Crypto helpers ────────────────────────────────────────────────────────────

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return bufferToBase64(array.buffer);
}

async function deriveKey(password: string, saltB64: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBuffer(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bufferToBase64(derived);
}

// ── Credentials management ────────────────────────────────────────────────────

/**
 * Initialise admin credentials in localStorage if they don't exist yet.
 * Safe to call multiple times — no-op when credentials already stored.
 */
export async function initAdminCredentials(): Promise<void> {
  const stored = localStorage.getItem(ADMIN_CREDS_KEY);
  if (!stored) {
    const salt = generateSalt();
    const passwordHash = await deriveKey(DEFAULT_ADMIN_PASSWORD, salt);
    const creds: AdminCreds = {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash,
      salt,
    };
    localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(creds));
  }
}

/** Returns true when the supplied username + password match the stored credentials. */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  await initAdminCredentials();
  try {
    const stored = localStorage.getItem(ADMIN_CREDS_KEY);
    if (!stored) return false;
    const creds: AdminCreds = JSON.parse(stored);
    if (username !== creds.username) return false;
    const hash = await deriveKey(password, creds.salt);
    return hash === creds.passwordHash;
  } catch {
    return false;
  }
}

/**
 * Update the admin password.
 * Returns true on success, false when `currentPassword` is wrong.
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const isValid = await verifyAdminCredentials(DEFAULT_ADMIN_USERNAME, currentPassword);
  if (!isValid) return false;

  const salt = generateSalt();
  const passwordHash = await deriveKey(newPassword, salt);
  const stored = localStorage.getItem(ADMIN_CREDS_KEY);
  const existing: AdminCreds = stored
    ? JSON.parse(stored)
    : { username: DEFAULT_ADMIN_USERNAME, passwordHash: '', salt: '' };

  const creds: AdminCreds = { ...existing, passwordHash, salt };
  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(creds));
  return true;
}

/** Reset credentials back to the built-in defaults. */
export async function resetAdminCredentials(): Promise<void> {
  localStorage.removeItem(ADMIN_CREDS_KEY);
  await initAdminCredentials();
}

// ── Session management ────────────────────────────────────────────────────────

/** Persist a new admin session (valid for 8 hours). */
export function setAdminSession(): void {
  const session: AdminSession = {
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

/** Invalidate the current admin session. */
export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

/** Synchronously check whether a valid admin session exists. */
export function isAdminSessionValid(): boolean {
  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return false;
    const session: AdminSession = JSON.parse(stored);
    return session.expiresAt > Date.now();
  } catch {
    return false;
  }
}
