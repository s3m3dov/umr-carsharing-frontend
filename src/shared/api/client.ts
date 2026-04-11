import { getToken } from '@/shared/auth/session';
import { parseResponse } from './error-parser';

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

function buildRequestUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

function mixedContentHint(): string | null {
  if (!BASE_URL || typeof window === 'undefined') {
    return null;
  }

  if (window.location.protocol !== 'https:') {
    return null;
  }

  if (!BASE_URL.startsWith('http://')) {
    return null;
  }

  return 'Cannot connect: app is loaded over HTTPS but API is HTTP. Open the app with http:// or enable HTTPS on the backend.';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;

  try {
    res = await fetch(buildRequestUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    const hint = mixedContentHint();
    throw new Error(hint ?? 'Failed to reach the API server. Check API URL and network connectivity.');
  }

  return parseResponse<T>(res);
}

export const apiClient = {
  get: <T>(path: string) =>
    request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
