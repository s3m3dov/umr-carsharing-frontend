import { clearSession } from '@/shared/auth/session';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Handles three response shapes from the backend:
//   1. Empty body — gateway-level 403 (AdminAuthorizationFilter rejects before reaching service)
//   2. JSON error body — service-level error (GlobalExceptionHandler / ApiError shape)
//   3. JSON success body — ApiResponseWrapper<T> { data, message, timestamp }
export async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearSession();
    window.location.replace('/login');
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  const text = await res.text();

  // Empty body — typically gateway rejection
  if (!text.trim()) {
    if (!res.ok) {
      const msg = res.status === 403 ? 'Access denied.' : `Request failed (${res.status})`;
      throw new ApiError(res.status, msg);
    }
    return undefined as T;
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(res.status, `Unexpected response (${res.status})`);
  }

  if (!res.ok) {
    // Service-level error: { error: { message, ... } } or { message }
    const errorObj = json['error'] as Record<string, unknown> | undefined;
    const message =
      (errorObj?.['message'] as string | undefined) ??
      (json['message'] as string | undefined) ??
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  // Success: ApiResponseWrapper<T> — extract the data field
  return json['data'] as T;
}
