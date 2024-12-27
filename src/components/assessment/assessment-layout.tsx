import { Outlet, Link } from 'react-router-dom';
import { AssessmentMenu } from './assessment-menu';
import { ChevronRight, Home, Brain } from 'lucide-react';
import { Header } from '@/components/layout/header';

export function AssessmentLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50 pb-8">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">Assessments</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Brain className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mental Health Assessments</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Track and monitor your mental health with validated assessment tools
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[240px,1fr] gap-6">
            <aside className="bg-white p-4 rounded-lg shadow-sm h-fit sticky top-4">
              <AssessmentMenu />
            </aside>
            
            <main className="bg-white p-6 rounded-lg shadow-sm min-h-[500px]">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}