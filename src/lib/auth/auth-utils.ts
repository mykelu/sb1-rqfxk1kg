import type { AuthError as SupabaseAuthError, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export type AuthError = {
  message: string;
  code?: string;
};

export async function createUserRecord(authId: string, email: string, role = 'adult', dateOfBirth?: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        auth_id: authId,
        email,
        role,
        date_of_birth: dateOfBirth,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw handleAuthError(error as PostgrestError);
    }
    throw error;
  }
}

export async function getUserRole(authId: string): Promise<string | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', authId)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User record doesn't exist, create it
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await createUserRecord(authId, user.email);
        return 'adult';
      }
      return null;
    }
    if (userError) throw userError;
    return userData?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export function handleAuthError(error: PostgrestError | SupabaseAuthError): AuthError {
  return { 
    message: error.message,
    code: error.code
  };
}