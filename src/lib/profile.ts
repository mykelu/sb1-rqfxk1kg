import { supabase } from './supabase';
import type { UserProfile } from '@/types/profile';

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!userData) return null;

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userData.id)
    .single();

  if (error) throw error;
  return profile;
}

export async function updateUserProfile(profile: Partial<UserProfile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!userData) throw new Error('User not found');

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userData.id,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}