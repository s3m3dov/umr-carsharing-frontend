import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  type UserRole,
  type Session,
  getSession,
  saveSession,
  clearSession,
} from '@/shared/auth/session';

interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  email: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession());

  const login = useCallback((token: string, role: string, email: string) => {
    const s: Session = { token, role: role as UserRole, email };
    saveSession(s);
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: session?.token ?? null,
        role: session?.role ?? null,
        email: session?.email ?? null,
        isAuthenticated: !!session?.token,
        isAdmin: session?.role === 'ADMIN',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
