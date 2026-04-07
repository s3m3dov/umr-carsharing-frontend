const SESSION_KEY = 'carsharing_session';

export type UserRole = 'ADMIN' | 'DRIVER' | 'PASSENGER';

export interface Session {
  token: string;
  role: UserRole;
  email: string;
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function saveSession(session: Session): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Clear stale keys from the old AuthContext implementation
  localStorage.removeItem('carpoolUserId');
  localStorage.removeItem('carpoolUser');
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('carpoolUserId');
  localStorage.removeItem('carpoolUser');
}
