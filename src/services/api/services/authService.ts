import { apiClient } from '../config';
import { AUTH_ENDPOINTS } from '../endpoints';
import { parseApiError } from '../errors';
import { setTokens, clearTokens } from '../../../utils/tokenManager';

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  firebaseUid: string;
  role: 'advertiser' | 'owner';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
  };
}

export const authService = {
  /**
   * Verify phone OTP and create/retrieve the backend user record.
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthTokens> {
    try {
      const { data } = await apiClient.post<AuthTokens>(AUTH_ENDPOINTS.VERIFY_OTP, payload);
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Exchange Google ID token for backend tokens.
   */
  async googleLogin(idToken: string): Promise<AuthTokens> {
    try {
      const { data } = await apiClient.post<AuthTokens>(AUTH_ENDPOINTS.GOOGLE_CALLBACK, {
        idToken,
      });
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Notify backend of logout and clear stored tokens.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } catch {
      // Best-effort: clear tokens regardless of server response
    } finally {
      clearTokens();
    }
  },

  /**
   * Refresh the backend access token using the refresh token.
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const { data } = await apiClient.post<AuthTokens>(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken,
      });
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data;
    } catch (err) {
      clearTokens();
      throw parseApiError(err);
    }
  },
};
