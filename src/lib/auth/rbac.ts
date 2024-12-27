import { supabase } from '../supabase';
import type { Database } from '@/types/supabase';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single();

  if (error) throw error;
  return data?.role || null;
}

export function checkPermission(
  requiredRole: UserRole,
  userRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'minor': 0,
    'adult': 1,
    'therapist': 2,
    'support': 2,
    'moderator': 3,
    'admin': 4,
    'super_admin': 5
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}