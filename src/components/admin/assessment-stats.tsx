import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getAssessmentStats } from '@/lib/api/admin';
import { useAuth } from '@/lib/auth/auth-context';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AssessmentStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      
      try {
        if (userRole === 'admin' || userRole === 'super_admin') {
          const data = await getAssessmentStats();
          setStats(data);
          setError(null);
        }
      } catch (error) {
        console.error('Error loading assessment stats:', error);
        setStats(null);
        setError('Failed to load assessment statistics');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [userRole, user]);

  if (loading) {
    return <div className="text-center py-4">Loading assessment statistics...</div>;
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="text-center py-4 text-red-600">
          {error || 'Error loading statistics'}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Assessment Analytics</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats?.assessmentsByType}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-sm text-gray-500">Total Assessments</p>
          <p className="text-2xl font-bold">{stats?.totalAssessments}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold">{stats?.completionRate}%</p>
        </div>
      </div>
    </Card>
  );
}