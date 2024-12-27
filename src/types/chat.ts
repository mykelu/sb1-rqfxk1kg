export type ChatRoomType = 'therapy_session' | 'crisis_support';
export type ChatRoomStatus = 'active' | 'archived';
export type ParticipantRole = 'client' | 'therapist' | 'crisis_responder';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  status: ChatRoomStatus;
  participants: ChatParticipant[];
  created_at: string;
  updated_at: string;
}

export interface ChatParticipant {
  room_id: string;
  user_id: string;
  role: ParticipantRole;
  public_key: string;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender?: {
    id: string;
    full_name: string | null;
  };
  encrypted_content: string;
  iv: string;
  is_anonymous: boolean;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export interface MessageReport {
  id: string;
  message_id: string;
  reporter_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
}