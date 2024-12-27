import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { subscribeToConsents } from '@/lib/realtime';
import { updateConsentStatus } from '@/lib/consent';
import { sendConsentNotification } from '@/lib/notifications';
import type { GuardianConsent } from '@/types/consent';

export function ConsentManagement() {
  const [consents, setConsents] = useState<GuardianConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPendingConsents() {
      const { data, error } = await supabase
        .from('guardian_consents')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setConsents(data || []);
      }
      setLoading(false);
    }

    loadPendingConsents();

    const channel = subscribeToConsents(null, (consent) => {
      setConsents((prev) => {
        if (consent.status !== 'pending') {
          return prev.filter((c) => c.id !== consent.id);
        }
        return [consent, ...prev.filter((c) => c.id !== consent.id)];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (consentId: string, status: GuardianConsent['status']) => {
    try {
      const updatedConsent = await updateConsentStatus(consentId, status);
      
      await sendConsentNotification(
        updatedConsent.guardianEmail,
        updatedConsent.guardianPhone,
        {
          guardianName: updatedConsent.guardianName,
          minorName: 'Minor',
          consentType: updatedConsent.consentType,
          actionUrl: `${window.location.origin}/consent/${updatedConsent.id}`,
        }
      );
    } catch (err) {
      console.error('Failed to update consent status:', err);
    }
  };

  if (loading) return <div>Loading consents...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Consent Management</h2>
      
      <div className="grid gap-6">
        {consents.map((consent) => (
          <div
            key={consent.id}
            className="bg-white p-6 rounded-lg shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {consent.consentType.replace('_', ' ').toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600">
                  Submitted on {new Date(consent.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Guardian Details</p>
                <p>{consent.guardianName}</p>
                <p>{consent.guardianRelationship}</p>
                <p>{consent.guardianEmail}</p>
                {consent.guardianPhone && <p>{consent.guardianPhone}</p>}
              </div>
              <div>
                <p className="font-medium">Additional Notes</p>
                <p>{consent.consentDetails.additionalNotes || 'None'}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => handleStatusUpdate(consent.id, 'approved')}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleStatusUpdate(consent.id, 'rejected')}
                variant="destructive"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}

        {consents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No pending consent requests
          </div>
        )}
      </div>
    </div>
  );
}