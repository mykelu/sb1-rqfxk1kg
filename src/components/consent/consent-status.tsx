import { useEffect, useState } from 'react';
import { getMinorConsents } from '@/lib/consent';
import type { GuardianConsent } from '@/types/consent';

interface ConsentStatusProps {
  minorId: string;
  consentType: GuardianConsent['consentType'];
}

export function ConsentStatus({ minorId, consentType }: ConsentStatusProps) {
  const [consents, setConsents] = useState<GuardianConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConsents() {
      try {
        const data = await getMinorConsents(minorId);
        setConsents(data.filter(consent => consent.consentType === consentType));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load consents');
      } finally {
        setLoading(false);
      }
    }

    loadConsents();
  }, [minorId, consentType]);

  if (loading) return <div>Loading consent status...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  const latestConsent = consents[0];
  if (!latestConsent) return <div>No consent records found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Consent Status</h3>
        <span className={`px-2 py-1 rounded-full text-sm ${
          latestConsent.status === 'approved' 
            ? 'bg-green-100 text-green-800'
            : latestConsent.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {latestConsent.status.charAt(0).toUpperCase() + latestConsent.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Guardian:</span> {latestConsent.guardianName}
        </p>
        <p>
          <span className="font-medium">Relationship:</span> {latestConsent.guardianRelationship}
        </p>
        <p>
          <span className="font-medium">Date:</span>{' '}
          {new Date(latestConsent.createdAt).toLocaleDateString()}
        </p>
        {latestConsent.validUntil && (
          <p>
            <span className="font-medium">Valid Until:</span>{' '}
            {new Date(latestConsent.validUntil).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}