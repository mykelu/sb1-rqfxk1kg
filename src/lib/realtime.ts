import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { GuardianConsent } from '@/types/consent';

type ConsentSubscriptionCallback = (consent: GuardianConsent) => void;

export function subscribeToConsents(
  minorId: string | null,
  callback: ConsentSubscriptionCallback
): RealtimeChannel {
  return supabase
    .channel('guardian_consents')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'guardian_consents',
        filter: minorId ? `minor_id=eq.${minorId}` : undefined,
      },
      (payload) => {
        callback(payload.new as GuardianConsent);
      }
    )
    .subscribe();
}