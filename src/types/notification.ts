export type NotificationType = 'reminder' | 'request';
export type NotificationStatus = 'pending' | 'read' | 'dismissed';

export interface AssessmentNotification {
  id: string;
  userId: string;
  createdBy: string | null;
  type: NotificationType;
  status: NotificationStatus;
  message: string;
  assessmentType: string;
  createdAt: string;
  readAt: string | null;
}