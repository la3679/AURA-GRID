import type { ApiResponse } from '@aura-grid/shared';
import { appEnv } from './env.js';
import { getFirebaseAuth } from './firebaseClient.js';

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  auth?: boolean;
}

const getIdToken = async (): Promise<string | null> => {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

/**
 * Typed fetch wrapper. Attaches the Firebase ID token on authenticated calls,
 * normalizes the {success,data,error} envelope, and never swallows errors.
 */
export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { method = 'GET', body, signal, auth = false } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await getIdToken();
    if (!token) {
      throw new ApiClientError('AUTH_ERROR', 'You must be signed in.', 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${appEnv.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiClientError('NETWORK_ERROR', 'Connection lost. Please try again.', 0);
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!json) {
    throw new ApiClientError('PARSE_ERROR', 'Unexpected server response.', res.status);
  }
  if (!json.success) {
    throw new ApiClientError(json.error.code, json.error.message, res.status, json.error.details);
  }
  return json.data;
};
