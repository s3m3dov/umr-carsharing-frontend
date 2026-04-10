import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { type UserRole } from '@/shared/auth/session';
import { type ReactNode } from 'react';

interface Props {
  requiredRole: UserRole;
  children: ReactNode;
}

export default function RoleRouteGuard({ requiredRole, children }: Props) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== requiredRole) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}
