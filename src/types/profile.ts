export type ProfileUpdateData = Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export interface Location {
  country: string;
  state?: string;
  city: string;
  timezone: string;
}

export interface MentalHealthPreferences {
  communicationPreference: 'chat' | 'video' | 'in-person';
  therapistGenderPreference?: 'male' | 'female' | 'any';
  specializations?: string[];
  languagePreference: string[];
  emergencyContactConsent: boolean;
}

export interface HealthHistory {
  diagnoses?: {
    condition: string;
    diagnosedAt?: string;
    status: 'active' | 'managed' | 'resolved';
  }[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
  }[];
  allergies?: string[];
  previousTherapy?: {
    type: string;
    duration: string;
    year: number;
  }[];
}

export interface UserProfile {
  id: string;
  userId: string;
  location: Location;
  pronouns?: string;
  birthDate?: string;
  preferences: MentalHealthPreferences;
  healthHistory: HealthHistory;
  createdAt: string;
  updatedAt: string;
}