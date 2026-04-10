import { ApiError } from './error-parser';

export function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const message = error.message.trim();
    if (!message) {
      return `HTTP ${error.status}: ${fallback}`;
    }

    if (message.includes(`HTTP ${error.status}`)) {
      return message;
    }

    return `HTTP ${error.status}: ${message}`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
