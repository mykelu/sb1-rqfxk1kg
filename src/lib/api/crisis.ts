import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import type { 
  CrisisSeverity, 
  CrisisStatus, 
  SupportMode,
  CrisisRequest,
  CrisisSession,
  ResponderMetrics,
  QueueMetrics
} from '@/types/crisis';

export async function createCrisisRequest(
  severity: CrisisSeverity,
  mode: SupportMode,
  initialAssessment: Record<string, any>
): Promise<CrisisRequest> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('crisis_queue')
    .insert({
      user_id: user.id,
      severity,
      mode,
      initial_assessment: initialAssessment,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw handleAuthError(error);
  return data;
}

export async function getQueueMetrics(): Promise<QueueMetrics> {
  const { data, error } = await supabase
    .from('crisis_queue')
    .select('severity, status')
    .in('status', ['pending', 'active']);

  if (error) throw handleAuthError(error);

  const metrics = {
    total: data.length,
    bySeverity: {
      low: data.filter(r => r.severity === 'low').length,
      medium: data.filter(r => r.severity === 'medium').length,
      high: data.filter(r => r.severity === 'high').length,
      immediate: data.filter(r => r.severity === 'immediate').length
    },
    byStatus: {
      pending: data.filter(r => r.status === 'pending').length,
      active: data.filter(r => r.status === 'active').length
    }
  };

  return metrics;
}

export async function getResponderMetrics(responderId: string): Promise<ResponderMetrics> {
  const { data, error } = await supabase
    .from('crisis_metrics')
    .select('*')
    .eq('responder_id', responderId)
    .single();

  if (error) throw handleAuthError(error);
  return data;
}

export async function assignCrisisRequest(
  requestId: string, 
  responderId: string
): Promise<void> {
  const { error } = await supabase
    .from('crisis_queue')
    .update({
      assigned_to: responderId,
      assigned_at: new Date().toISOString(),
      status: 'active'
    })
    .eq('id', requestId);

  if (error) throw handleAuthError(error);
}

export async function startCrisisSession(
  queueId: string,
  responderId: string,
  userId: string,
  mode: SupportMode
): Promise<CrisisSession> {
  const { data, error } = await supabase
    .from('crisis_sessions')
    .insert({
      queue_id: queueId,
      responder_id: responderId,
      user_id: userId,
      mode,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw handleAuthError(error);
  return data;
}

export async function endCrisisSession(
  sessionId: string,
  outcome: string,
  notes?: string,
  followupNeeded: boolean = false
): Promise<void> {
  const { error } = await supabase
    .from('crisis_sessions')
    .update({
      ended_at: new Date().toISOString(),
      outcome,
      notes,
      followup_needed: followupNeeded,
      duration: `interval '${Date.now() - new Date(sessionId).getTime()} milliseconds'`
    })
    .eq('id', sessionId);

  if (error) throw handleAuthError(error);
}