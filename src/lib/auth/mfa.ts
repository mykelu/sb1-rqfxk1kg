import { supabase } from '../supabase';

export async function enrollMFA(factorId: string) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });
  
  if (error) throw { message: error.message, status: error.status };
  return data;
}

export async function verifyMFA(factorId: string, code: string) {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    code,
  });
  
  if (error) throw { message: error.message, status: error.status };
  return data;
}

export async function unenrollMFA(factorId: string) {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
  
  if (error) throw { message: error.message, status: error.status };
  return data;
}

export async function challengeMFA(factorId: string) {
  const { data, error } = await supabase.auth.mfa.challenge({ factorId });
  
  if (error) throw { message: error.message, status: error.status };
  return data;
}