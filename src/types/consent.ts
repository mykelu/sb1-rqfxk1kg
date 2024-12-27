export type ConsentType = 
  | 'account_creation'
  | 'therapy_access'
  | 'data_collection'
  | 'emergency_contact';

export type ConsentStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'revoked';

export interface GuardianConsent {
  id: string;
  minorId: string;
  guardianId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  validUntil: string | null;
  guardianName: string;
  guardianRelationship: string;
  guardianEmail: string;
  guardianPhone?: string;
  consentDetails: {
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    additionalNotes?: string;
  };
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}