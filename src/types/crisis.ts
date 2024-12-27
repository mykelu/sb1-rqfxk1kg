export type CrisisSeverity = 'low' | 'medium' | 'high' | 'immediate';
export type CrisisStatus = 'pending' | 'active' | 'resolved' | 'escalated';
export type SupportMode = 'chat' | 'audio' | 'video';

export interface CrisisRequest {
  id: string;
  user_id: string;
  severity: CrisisSeverity;
  status: CrisisStatus;
  mode: SupportMode;
  initial_assessment: Record<string, any>;
  assigned_to: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrisisSession {
  id: string;
  queue_id: string;
  responder_id: string;
  user_id: string;
  mode: SupportMode;
  started_at: string;
  ended_at: string | null;
  duration: string | null;
  notes: string | null;
  outcome: string | null;
  followup_needed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResponderMetrics {
  id: string;
  responder_id: string;
  total_sessions: number;
  avg_response_time: string;
  avg_session_duration: string;
  positive_outcomes: number;
  escalations: number;
  created_at: string;
  updated_at: string;
}

export interface QueueMetrics {
  total: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    immediate: number;
  };
  byStatus: {
    pending: number;
    active: number;
  };
}