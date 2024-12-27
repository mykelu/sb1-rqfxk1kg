import { Header } from '@/components/layout/header';
import { ConsentManagement } from '@/components/admin/consent-management';
import { ProtectedRoute } from '@/components/auth/protected-route';

export function AdminConsentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ConsentManagement />
        </main>
      </div>
    </ProtectedRoute>
  );
}