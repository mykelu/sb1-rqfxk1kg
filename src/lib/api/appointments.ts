import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import type { Appointment, AppointmentType } from '@/types/appointment';
import { formatToGMT8 } from '@/lib/utils/date';

export async function getAvailableSlots(
  therapistId: string,
  date: Date
): Promise<Date[]> {
  const { data, error } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .eq('day_of_week', date.getDay())
    .eq('is_available', true)
    .single();

  if (error) throw handleAuthError(error);
  if (!data) return [];

  // Get existing appointments
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('therapist_id', therapistId)
    .gte('start_time', startOfDay.toISOString())
    .lte('end_time', endOfDay.toISOString())
    .not('status', 'in', ['cancelled', 'completed']);

  if (appointmentsError) throw handleAuthError(appointmentsError);

  // Generate available slots
  const slots: Date[] = [];
  const slotDuration = 50; // 50 minutes per session
  const breakDuration = 10; // 10 minutes break

  const startTime = new Date(date);
  startTime.setHours(
    parseInt(data.start_time.split(':')[0]),
    parseInt(data.start_time.split(':')[1]),
    0,
    0
  );

  const endTime = new Date(date);
  endTime.setHours(
    parseInt(data.end_time.split(':')[0]),
    parseInt(data.end_time.split(':')[1]),
    0,
    0
  );

  let currentSlot = startTime;
  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
    
    const hasConflict = appointments?.some(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      return (
        (currentSlot >= appointmentStart && currentSlot < appointmentEnd) ||
        (slotEnd > appointmentStart && slotEnd <= appointmentEnd)
      );
    });

    if (!hasConflict) {
      slots.push(new Date(currentSlot));
    }

    currentSlot = new Date(currentSlot.getTime() + (slotDuration + breakDuration) * 60000);
  }

  return slots;
}

export async function bookAppointment(
  therapistId: string,
  startTime: Date,
  type: AppointmentType,
  notes?: string
): Promise<Appointment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const endTime = new Date(startTime.getTime() + 50 * 60000);

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      therapist_id: therapistId,
      client_id: user.id,
      start_time: formatToGMT8(startTime),
      end_time: formatToGMT8(endTime),
      type,
      notes,
      status: 'scheduled'
    })
    .select()
    .single();

  if (error) throw handleAuthError(error);
  return data;
}

export async function getAppointments(
  role: 'client' | 'therapist',
  status?: string[]
): Promise<Appointment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('appointments')
    .select(`
      *,
      therapist:therapist_id(
        id,
        full_name
      ),
      client:client_id(
        id,
        full_name
      )
    `)
    .eq(role === 'client' ? 'client_id' : 'therapist_id', user.id)
    .order('start_time', { ascending: true });

  if (status && status.length > 0) {
    query = query.in('status', status);
  }

  const { data, error } = await query;
  if (error) throw handleAuthError(error);
  return data || [];
}