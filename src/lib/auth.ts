import { supabase } from './supabase';
import { Provider } from '@supabase/supabase-js';
import { handleAuthError, createUserRecord } from './auth/auth-utils';
import { useNavigate } from 'react-router-dom';
import { isMinor } from './utils/age';

export type { AuthError } from './auth/auth-utils';

export async function signInWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw handleAuthError(error);
  return data;
}

export async function signUp(
  email: string,
  password: string,
  dateOfBirth?: string
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        date_of_birth: dateOfBirth
      }
    }
  });
  
  if (authError) throw handleAuthError(authError);
  if (!authData.user) throw { message: 'Registration failed' };

  const minor = dateOfBirth ? isMinor(dateOfBirth) : false;
  try {
    await createUserRecord(
      authData.user.id,
      email,
      minor ? 'minor' : 'adult',
      dateOfBirth
    );
    return authData;
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw { 
      message: error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message
    };
  }

  if (!data.user) {
    throw { message: 'Login failed' };
  }

  return data;
}

export async function signOut(redirectTo = '/') {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear any local state
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();

    // Clear Supabase session
    await supabase.auth.clearSession();

    // Force reload to clear any remaining state
    window.location.href = redirectTo;
  } catch (error) {
    console.error('Sign out error:', error);
    // Still redirect even if there's an error
    window.location.href = redirectTo;
  }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw handleAuthError(error);
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw handleAuthError(error);
}