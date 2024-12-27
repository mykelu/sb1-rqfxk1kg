import { useNavigate, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/lib/auth/auth-context';

interface LoginPageProps {
  redirectTo?: string;
}

export function LoginPage({ redirectTo = '/' }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isLoading, error: authError } = useAuth();
  const from = searchParams.get('redirect') || redirectTo;

  const handleLoginSuccess = (userId: string) => {
    navigate(from, { replace: true });
  };

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

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          {authError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {authError}
            </div>
          )}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <AuthForm mode="login" onSuccess={handleLoginSuccess} />
          </div>
        </div>
      </main>
    </div>
  );
}