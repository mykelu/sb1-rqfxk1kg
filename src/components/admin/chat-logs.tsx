import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { getChatLogs } from '@/lib/api/admin';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils/date';
import { Search, Download } from 'lucide-react';

export function ChatLogs() {
  const { userRole } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    roomId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    async function loadLogs() {
      if (userRole !== 'super_admin') {
        setError('Unauthorized access');
        setLoading(false);
        return;
      }

      try {
        const data = await getChatLogs(
          filters.roomId || undefined,
          filters.startDate || undefined,
          filters.endDate || undefined
        );
        setLogs(data);
        setError(null);
      } catch (err) {
        console.error('Error loading chat logs:', err);
        setError('Failed to load chat logs');
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [userRole, filters]);

  const handleExport = () => {
    const csvContent = logs.map(log => ({
      'Room Type': log.room?.type || 'Unknown',
      'Sender': log.sender?.full_name || 'Unknown',
      'Created At': formatDateTime(log.created_at),
      'Recipients': log.recipient_ids?.length || 0,
      'Last Accessed': log.access_log[log.access_log.length - 1]?.accessed_at || 'Never'
    }));

    const csv = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-4">Loading chat logs...</div>;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Chat Audit Logs</h2>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            placeholder="Room ID"
            value={filters.roomId}
            onChange={(e) => setFilters(f => ({ ...f, roomId: e.target.value }))}
          />
        </div>
        <div>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {log.room?.type === 'crisis_support' ? 'Crisis Support' : 'Therapy Session'}
                </p>
                <p className="text-sm text-gray-600">
                  From: {log.sender?.full_name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  Recipients: {log.recipient_ids?.length || 0}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>{formatDateTime(log.created_at)}</p>
                <p>Last accessed: {
                  log.access_log[log.access_log.length - 1]?.accessed_at
                    ? formatDateTime(log.access_log[log.access_log.length - 1].accessed_at)
                    : 'Never'
                }</p>
              </div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No chat logs found
          </div>
        )}
      </div>
    </Card>
  );
}