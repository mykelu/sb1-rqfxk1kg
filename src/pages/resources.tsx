import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Resource = Database['public']['Tables']['resources']['Row'];

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resources:', error);
      } else {
        setResources(data || []);
      }
      setLoading(false);
    }

    fetchResources();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">Resources</span>
            </div>
            
            <div className="flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mental Health Resources</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Access our curated collection of mental health resources and self-help tools
                </p>
              </div>
            </div>
          </div>

        {loading ? (
          <div className="text-center">Loading resources...</div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-3">{resource.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{resource.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{resource.category}</span>
                  <Button variant="outline">Read More</Button>
                </div>
              </div>
            ))}
            {resources.length === 0 && (
              <div className="col-span-full text-center text-gray-600">
                No resources available at the moment.
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}