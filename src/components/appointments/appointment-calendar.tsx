import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { getAvailableSlots, bookAppointment } from '@/lib/api/appointments';
import { getTherapists } from '@/lib/api/therapists';
import { format } from 'date-fns';

interface Therapist {
  id: string;
  full_name: string;
}

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTherapists() {
      try {
        const data = await getTherapists();
        setTherapists(data);
        if (data.length > 0) {
          setSelectedTherapist(data[0].id);
        }
      } catch (err) {
        console.error('Error loading therapists:', err);
        setError('Failed to load therapists');
      }
    }

    loadTherapists();
  }, []);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !selectedTherapist) return;
    
    setSelectedDate(date);
    setLoading(true);
    setError(null);

    try {
      const slots = await getAvailableSlots(selectedTherapist, date);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error loading slots:', err);
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slot: Date) => {
    try {
      await bookAppointment(
        selectedTherapist,
        slot,
        'therapy_session'
      );
      setAvailableSlots(prev => prev.filter(s => s.getTime() !== slot.getTime()));
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Therapist</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={selectedTherapist}
            onChange={(e) => {
              setSelectedTherapist(e.target.value);
              if (selectedDate) {
                handleDateSelect(selectedDate);
              }
            }}
          >
            {therapists.map((therapist) => (
              <option key={therapist.id} value={therapist.id}>
                {therapist.full_name}
              </option>
            ))}
          </select>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
          disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
        />

        <div className="space-y-4">
          <h3 className="font-medium">Available Slots</h3>
          
          {loading ? (
            <div className="text-center py-4">Loading available slots...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">{error}</div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.toISOString()}
                  variant="outline"
                  onClick={() => handleBookSlot(slot)}
                >
                  {format(slot, 'h:mm a')}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No available slots for this date
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}