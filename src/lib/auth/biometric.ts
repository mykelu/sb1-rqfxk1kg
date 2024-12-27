import { supabase } from '../supabase';

export async function isBiometricAvailable() {
  if (!window.PublicKeyCredential) {
    return false;
  }
  return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

export async function enrollBiometric(userId: string) {
  const { data: { publicKey }, error: credentialError } = 
    await supabase.functions.invoke('create-credential-options', {
      body: { userId }
    });
    
  if (credentialError) throw credentialError;

  const credential = await navigator.credentials.create({
    publicKey: publicKey
  });

  const { error } = await supabase.functions.invoke('verify-credential', {
    body: { credential }
  });

  if (error) throw error;
}

export async function verifyBiometric() {
  const { data: { publicKey }, error: assertionError } = 
    await supabase.functions.invoke('get-assertion-options');
    
  if (assertionError) throw assertionError;

  const assertion = await navigator.credentials.get({
    publicKey: publicKey
  });

  const { error } = await supabase.functions.invoke('verify-assertion', {
    body: { assertion }
  });

  if (error) throw error;
}