import { AxiosError } from 'axios';

// ── Custom Error Classes ──────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found.`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(message = 'Internal server error. Please try again later.') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'ServerError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error. Check your internet connection.') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// ── HTTP Status → Error Message ───────────────────────────────────────────────

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Session expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. The resource may already exist.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please slow down and try again.',
  500: 'Internal server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service unavailable. Please try again later.',
};

// ── Error Parser ──────────────────────────────────────────────────────────────

/**
 * Convert an Axios error or unknown error into a user-friendly AppError.
 */
export function parseApiError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof AxiosError) {
    // Network / timeout
    if (!error.response) {
      return new NetworkError();
    }

    const status = error.response.status;
    const responseData = error.response.data as Record<string, unknown> | undefined;
    const serverMessage =
      typeof responseData?.message === 'string' ? responseData.message : undefined;

    if (status === 401) {
      return new AuthError(serverMessage ?? HTTP_ERROR_MESSAGES[401]);
    }

    if (status === 422) {
      const fields =
        typeof responseData?.errors === 'object' && responseData.errors !== null
          ? (responseData.errors as Record<string, string>)
          : undefined;
      return new ValidationError(serverMessage ?? HTTP_ERROR_MESSAGES[422], fields);
    }

    if (status === 404) {
      return new NotFoundError(serverMessage ?? 'Resource');
    }

    if (status >= 500) {
      return new ServerError(serverMessage ?? HTTP_ERROR_MESSAGES[status]);
    }

    const fallback = HTTP_ERROR_MESSAGES[status] ?? 'An unexpected error occurred.';
    return new AppError(serverMessage ?? fallback, String(status), status);
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('An unexpected error occurred.');
}

// ── Retry Logic ───────────────────────────────────────────────────────────────

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export function isRetryable(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof AppError && error.statusCode) {
    return RETRYABLE_STATUS_CODES.has(error.statusCode);
  }
  return false;
}

/**
 * Retry an async function up to maxAttempts times with exponential back-off.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const parsed = parseApiError(err);
      if (!isRetryable(parsed) || attempt === maxAttempts) throw parsed;
      await delay(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw parseApiError(lastError);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
