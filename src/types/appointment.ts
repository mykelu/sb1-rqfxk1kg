export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show';

export type AppointmentType =
  | 'initial_consultation'
  | 'therapy_session'
  | 'follow_up'
  | 'crisis_intervention';

export interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  googleEventId?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistAvailability {
  id?: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isAvailable: boolean;
}

export interface AppointmentNotification {
  id: string;
  appointmentId: string;
  recipientId: string;
  type: string;
  status: string;
  scheduledFor: string;
  sentAt?: string;
  error?: string;
  createdAt: string;
}