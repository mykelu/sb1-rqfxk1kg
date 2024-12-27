import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { AuthForm } from '@/components/auth/auth-form';
import { ConsentForm } from '@/components/consent/consent-form';
import { useState } from 'react';

export function SignupPage() {
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(false);
  const [minorId, setMinorId] = useState<string | null>(null);

  const handleRegistrationSuccess = (userId: string, isMinor: boolean) => {
    if (isMinor) {
      setMinorId(userId);
      setShowConsent(true);
    } else {
      navigate('/profile');
    }
  };

  const handleConsentSuccess = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">
            {showConsent ? 'Guardian Consent Required' : 'Create Account'}
          </h1>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {showConsent && minorId ? (
              <ConsentForm
                minorId={minorId}
                consentType="account_creation"
                onSuccess={handleConsentSuccess}
              />
            ) : (
              <>
                <AuthForm 
                  mode="signup" 
                  onSuccess={handleRegistrationSuccess}
                />
                <p className="mt-4 text-sm text-center text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Login here
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}