import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import type { AdminConfig } from '@/types/admin';
import { decryptMessage } from '../encryption';

export async function getAdminConfig(): Promise<AdminConfig> {
  const { data, error } = await supabase
    .from('admin_config')
    .select('*')
    .order('key');

  if (error) throw handleAuthError(error);
  return data.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
}

export async function updateAdminConfig(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from('admin_config')
    .update({ 
      value,
      updated_at: new Date().toISOString()
    })
    .eq('key', key);

  if (error) throw handleAuthError(error);
}

export async function getChatLogs(roomId?: string, startDate?: string, endDate?: string) {
  const query = supabase
    .from('chat_audit_logs')
    .select(`
      *,
      sender:users!sender_id(full_name),
      room:chat_rooms!room_id(type)
    `)
    .order('created_at', { ascending: false });

  if (roomId) {
    query.eq('room_id', roomId);
  }

  if (startDate) {
    query.gte('created_at', startDate);
  }

  if (endDate) {
    query.lte('created_at', endDate);
  }

  const { data, error } = await query;
  if (error) throw handleAuthError(error);

  // Record access for each log entry
  await Promise.all(
    (data || []).map(log => 
      supabase.rpc('record_audit_log_access', { log_id: log.id })
    )
  );

  return data || [];
}

export async function getUserStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact' });

  // Get new users this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .gt('created_at', firstDayOfMonth.toISOString());

  // Get role distribution
  const { data: roles } = await supabase
    .from('users')
    .select('role');

  const roleDistribution = roles?.reduce((acc: any, { role }) => {
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  return {
    totalUsers,
    newUsers,
    roleDistribution: Object.entries(roleDistribution || {}).map(([name, value]) => ({
      name,
      value
    }))
  };
}

export async function getAssessmentStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get total assessments
  const { count: totalAssessments } = await supabase
    .from('assessments')
    .select('*', { count: 'exact' });

  // Get assessments by type
  const { data: assessments } = await supabase
    .from('assessments')
    .select('type');

  const assessmentsByType = assessments?.reduce((acc: any, { type }) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Calculate completion rate (completed vs started)
  const { count: startedAssessments } = await supabase
    .from('assessments')
    .select('*', { count: 'exact' })
    .is('score', null);

  const completionRate = totalAssessments 
    ? Math.round(((totalAssessments - (startedAssessments || 0)) / totalAssessments) * 100)
    : 0;

  return {
    totalAssessments,
    completionRate,
    assessmentsByType: Object.entries(assessmentsByType || {}).map(([name, count]) => ({
      name,
      count
    }))
  };
}


export async function getEngagementMetrics() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Get active users (users who have logged in within 30 days)
  const { count: activeUsers } = await supabase.rpc('get_active_users');

  // Get total assessments
  const { count: totalAssessments } = await supabase
    .from('assessments')
    .select('*', { count: 'exact' });

  // Get support sessions this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const { count: supportSessions } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact' })
    .gt('created_at', firstDayOfMonth.toISOString());

  // Get crisis reports in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: crisisReports } = await supabase
    .from('crisis_reports')
    .select('*', { count: 'exact' })
    .gt('created_at', sevenDaysAgo.toISOString());

  // Get activity trend
  const { data: activityTrend } = await supabase
    .from('analytics_events')
    .select('created_at')
    .gt('created_at', thirtyDaysAgo.toISOString()) 
    .order('created_at', { ascending: true });

  return {
    activeUsers,
    totalAssessments,
    supportSessions,
    crisisReports,
    activityTrend: processActivityTrend(activityTrend || [])
  };
}

export async function updateSystemSettings(settings: Record<string, any>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('system_settings')
    .upsert({
      updated_by: user.id,
      settings: settings,
      updated_at: new Date().toISOString()
    });

  if (error) throw handleAuthError(error);
}

function processActivityTrend(events: any[]) {
  // Group events by date and count
  const grouped = events.reduce((acc, event) => {
    const date = new Date(event.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Convert to array format for chart
  return Object.entries(grouped).map(([date, count]) => ({
    date,
    users: count
  }));
}