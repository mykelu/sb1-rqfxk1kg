import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import type { UserProfile, ProfileUpdateData, HealthHistory } from '@/types/profile';

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) throw handleAuthError(error);
  return data;
}

export async function updateProfile(updates: ProfileUpdateData): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw handleAuthError(error);
  return data;
}

export async function updatePreferences(preferences: UserProfile['preferences']): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_profiles')
    .update({ preferences })
    .eq('user_id', user.id);

  if (error) throw handleAuthError(error);
}

export async function updateHealthHistory(updates: Partial<HealthHistory>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!userData) throw new Error('User not found');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('health_history')
    .eq('user_id', userData.id)
    .single();

  const updatedHistory = {
    ...(profile?.health_history || {}),
    ...updates
  };

  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      health_history: updatedHistory,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userData.id);

  if (error) throw handleAuthError(error);
}