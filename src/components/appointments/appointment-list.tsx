import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getAppointments } from '@/lib/api/appointments';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

export function AppointmentList() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const data = await getAppointments('client', ['scheduled', 'confirmed']);
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading appointments...</div>
      </Card>
    );
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
      <h2 className="font-semibold mb-4">Upcoming Sessions</h2>
      
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="p-4 bg-gray-50 rounded-lg space-y-2"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(appointment.start_time), 'MMMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(appointment.start_time), 'h:mm a')}
              </span>
            </div>

            <div className="text-sm">
              with {appointment.therapist?.full_name || 'Unknown Therapist'}
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="text-center text-gray-500">
            No upcoming appointments
          </div>
        )}
      </div>
    </Card>
  );
}