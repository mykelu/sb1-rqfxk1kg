import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getUserStats } from '@/lib/api/admin';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#f43f5e', '#10b981', '#8b5cf6'];

export function UserStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getUserStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) return <div>Loading user statistics...</div>;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats?.roleDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {stats?.roleDistribution.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats?.totalUsers}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">New This Month</p>
          <p className="text-2xl font-bold">{stats?.newUsers}</p>
        </div>
      </div>
    </Card>
  );
}