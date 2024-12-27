import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getEngagementMetrics } from '@/lib/api/admin';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function EngagementMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getEngagementMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  if (loading) return <div>Loading metrics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Engagement Metrics</h2>
      
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold">{metrics?.activeUsers}</p>
          <span className="text-xs text-gray-500">Last 30 days</span>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Assessments</h3>
          <p className="text-2xl font-bold">{metrics?.totalAssessments}</p>
          <span className="text-xs text-gray-500">Total completed</span>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Support Sessions</h3>
          <p className="text-2xl font-bold">{metrics?.supportSessions}</p>
          <span className="text-xs text-gray-500">This month</span>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Crisis Reports</h3>
          <p className="text-2xl font-bold">{metrics?.crisisReports}</p>
          <span className="text-xs text-gray-500">Last 7 days</span>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">User Activity Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics?.activityTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}