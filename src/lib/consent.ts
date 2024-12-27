import { supabase } from './supabase';
import type { GuardianConsent, ConsentType } from '@/types/consent';

export async function createConsent(
  minorId: string,
  consentType: ConsentType,
  guardianData: {
    name: string;
    relationship: string;
    email: string;
    phone?: string;
  },
  consentDetails: GuardianConsent['consentDetails']
): Promise<GuardianConsent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: guardianUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!guardianUser) throw new Error('Guardian not found');

  const { data, error } = await supabase
    .from('guardian_consents')
    .insert({
      minor_id: minorId,
      guardian_id: guardianUser.id,
      consent_type: consentType,
      guardian_name: guardianData.name,
      guardian_relationship: guardianData.relationship,
      guardian_email: guardianData.email,
      guardian_phone: guardianData.phone,
      consent_details: consentDetails,
      ip_address: await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMinorConsents(minorId: string): Promise<GuardianConsent[]> {
  const { data, error } = await supabase
    .from('guardian_consents')
    .select('*')
    .eq('minor_id', minorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateConsentStatus(
  consentId: string,
  status: GuardianConsent['status']
): Promise<GuardianConsent> {
  const { data, error } = await supabase
    .from('guardian_consents')
    .update({ status })
    .eq('id', consentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}