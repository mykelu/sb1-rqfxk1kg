import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';

async function getDatabaseUserId(authId: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Create user record if it doesn't exist
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ 
          auth_id: authId,
          role: 'adult',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw handleAuthError(insertError);
      return newUser.id;
    }
    throw handleAuthError(error);
  }

  return data.id;
}

export async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    return await getDatabaseUserId(user.id);
  } catch (error) {
    console.error('Error getting user ID:', error);
    throw error;
  }
}

async function ensureUserRecord(authId: string): Promise<void> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .single();

  if (error && error.code === 'PGRST116') {
    // User record doesn't exist, create it
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        auth_id: authId,
        role: 'adult',
        created_at: new Date().toISOString()
      });
    
    if (insertError) throw handleAuthError(insertError);
  } else if (error) {
    throw handleAuthError(error);
  }
}

export async function getUserName(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('full_name')
      .eq('auth_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user name:', error);
      return null;
    }

    return data?.full_name;
  } catch (error) {
    console.error('Error loading user name:', error);
    return null;
  }
}