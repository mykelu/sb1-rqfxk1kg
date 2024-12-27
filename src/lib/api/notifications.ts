import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import type { AssessmentNotification, NotificationStatus } from '@/types/notification';

export async function getNotifications(): Promise<AssessmentNotification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('assessment_notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw handleAuthError(error);
  return data;
}

export async function updateNotificationStatus(
  notificationId: string,
  status: NotificationStatus
): Promise<void> {
  const { error } = await supabase
    .from('assessment_notifications')
    .update({
      status,
      read_at: status === 'read' ? new Date().toISOString() : null
    })
    .eq('id', notificationId);

  if (error) throw handleAuthError(error);
}

export async function createAssessmentRequest(
  userId: string,
  assessmentType: string,
  message: string
): Promise<void> {
  const { error } = await supabase
    .from('assessment_notifications')
    .insert({
      user_id: userId,
      type: 'request',
      message,
      assessment_type: assessmentType
    });

  if (error) throw handleAuthError(error);
}