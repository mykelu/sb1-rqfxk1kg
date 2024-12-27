export type TherapistSpecialization =
  | 'anxiety'
  | 'depression'
  | 'trauma'
  | 'relationships'
  | 'addiction'
  | 'grief'
  | 'stress'
  | 'eating_disorders'
  | 'family'
  | 'youth';

export interface TherapistProfile {
  id: string;
  user_id: string;
  bio: string;
  education: string[];
  specializations: TherapistSpecialization[];
  years_experience: number;
  languages: string[];
  accepts_insurance: boolean;
  insurance_providers?: string[];
  session_rate: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  review_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TherapistReview {
  id: string;
  therapist_id: string;
  reviewer_id: string;
  reviewer?: {
    full_name: string | null;
  };
  rating: number;
  review?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface TherapistFilters {
  specializations?: TherapistSpecialization[];
  languages?: string[];
  minRating?: number;
  maxRate?: number;
  acceptsInsurance?: boolean;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}