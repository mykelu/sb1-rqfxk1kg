import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Users } from 'lucide-react';
import { TherapistList } from '@/components/therapists/therapist-list';
import { TherapistFilters } from '@/components/therapists/therapist-filters';
import type { TherapistFilters as FilterOptions } from '@/types/therapist';

export function TherapistsPage() {
  const [filters, setFilters] = useState<FilterOptions>({});

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">Therapists</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find a Therapist</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Browse our network of licensed therapists and find the right match for you
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[300px,1fr] gap-6">
            <aside className="space-y-6">
              <TherapistFilters
                filters={filters}
                onChange={setFilters}
              />
            </aside>
            
            <main>
              <TherapistList filters={filters} />
            </main>
          </div>
        </div>
      </main>
    </div>
  );
}