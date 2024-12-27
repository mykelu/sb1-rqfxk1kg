export interface AssessmentSettings {
  minDaysBetweenAssessments: number;
  reminderEnabled: boolean;
  crisisThreshold: {
    phq9: number;
    gad7: number;
  };
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  reminderDelay: number;
}

export interface SupportSettings {
  maxSessionDuration: number;
  followupEnabled: boolean;
  followupDelay: number;
}

export interface AdminConfig {
  assessment_settings: AssessmentSettings;
  notification_settings: NotificationSettings;
  support_settings: SupportSettings;
}