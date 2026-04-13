import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getTokens, clearTokens, setTokens } from '../../utils/tokenManager';
import { refreshIdToken } from '../firebase/auth';

const BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:5000';
const TIMEOUT = Number(process.env.REACT_APP_API_TIMEOUT ?? 10000);

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

/**
 * Custom event dispatched when a 401 cannot be recovered via token refresh.
 * The AuthContext (or router) should listen for this and redirect to login.
 */
export const SESSION_EXPIRED_EVENT = 'adride:session-expired';

// ── Request Interceptor ───────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();
    if (tokens?.accessToken) {
      config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while a refresh is in progress
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newFirebaseToken = await refreshIdToken();
        if (!newFirebaseToken) throw new Error('Token refresh failed');

        const tokens = getTokens();
        setTokens({ accessToken: newFirebaseToken, refreshToken: tokens?.refreshToken ?? '' });

        refreshQueue.forEach((cb) => cb(newFirebaseToken));
        refreshQueue = [];

        originalRequest.headers.set('Authorization', `Bearer ${newFirebaseToken}`);
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        refreshQueue = [];
        // Don't dispatch session-expired for the refresh-token endpoint itself
        // (avoids infinite loops and spurious logouts during the auth flow).
        const requestUrl = originalRequest.url ?? '';
        const isRefreshEndpoint = requestUrl.split('?')[0].endsWith('/auth/refresh-token');
        if (!isRefreshEndpoint) {
          window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
