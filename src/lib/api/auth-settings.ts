import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';

export async function updateEmail(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw handleAuthError(error);
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) throw handleAuthError(signInError);

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw handleAuthError(error);
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_user_account');
  if (error) throw handleAuthError(error);
}