import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import type { Database } from '@/types/supabase';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, isLoading, error } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/login" state={{ from: location.pathname, error }} replace />;
  }

  if (!user) {
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(currentPath)}`}
        replace 
      />
    );
  }

  if (requiredRole && userRole && !checkPermission(requiredRole, userRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        replace 
        state={{ error: 'Insufficient permissions' }} 
      />
    );
  }

  return <>{children}</>;
}

function checkPermission(requiredRole: UserRole, userRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'minor': 0,
    'adult': 1,
    'therapist': 2,
    'support': 2,
    'moderator': 3,
    'admin': 4,
    'super_admin': 5
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}