const ACCESS_TOKEN_KEY = 'adride_access_token';
const REFRESH_TOKEN_KEY = 'adride_refresh_token';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Persist tokens in sessionStorage (cleared on tab close).
 * For persistent sessions, swap to localStorage.
 */
export function setTokens(tokens: StoredTokens): void {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
    // Storage may be unavailable in some environments
  }
}

export function getTokens(): StoredTokens | null {
  try {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!accessToken) return null;
    return { accessToken, refreshToken: refreshToken ?? '' };
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // no-op
  }
}

export function getAccessToken(): string | null {
  return getTokens()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getTokens()?.refreshToken ?? null;
}

export function hasValidToken(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  try {
    // JWT payload is the second base64-encoded segment
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry: number = payload.exp ?? 0;
    // Consider tokens expiring within 60 seconds as expired
    return expiry * 1000 > Date.now() + 60_000;
  } catch {
    // If we can't parse the token, treat it as present but unvalidated
    return true;
  }
}
