import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth/auth-context';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mental Health Support Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            A safe space for support, growth, and healing. Connect with professionals
            and access resources to help you on your journey to better mental health.
          </p>
        </section>

        {user ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Crisis Support</h2>
              <p className="text-gray-600 mb-4">
                24/7 immediate support for those in crisis. You're not alone.
              </p>
              <Link to="/support">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">Get Help Now</Button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Therapy Services</h2>
              <p className="text-gray-600 mb-4">
                Connect with licensed therapists for online or in-person sessions.
              </p>
              <Link to="/appointments">
                <Button className="w-full">Book Session</Button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Self-Help Tools</h2>
              <p className="text-gray-600 mb-4">
                Access resources and tools for managing your mental well-being.
              </p>
              <Link to="/assessments">
                <Button className="w-full">View Resources</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center mt-8">
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Join our community to access support services and resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">Create Account</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Login</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}