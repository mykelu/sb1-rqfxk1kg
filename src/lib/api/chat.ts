import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import { encryptMessage, decryptMessage } from '../encryption';
import type { ChatRoom, ChatMessage, ChatRoomType } from '@/types/chat';

export async function createChatRoom(
  type: ChatRoomType,
  clientId?: string
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('create_chat_room', { 
      p_type: type,
      p_client_id: clientId
    });

  if (error) throw handleAuthError(error);
  return data;
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      participants:chat_participants(
        user_id,
        role,
        public_key
      )
    `)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (error) throw handleAuthError(error);
  return data || [];
}

export async function sendMessage(
  roomId: string,
  content: string,
  isAnonymous: boolean = false
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get recipients' public keys
  const { data: participants } = await supabase
    .from('chat_participants')
    .select('public_key')
    .eq('room_id', roomId);

  if (!participants) throw new Error('No participants found');

  // Encrypt message for each recipient
  const { encryptedContent, iv } = await encryptMessage(content, participants.map(p => p.public_key));

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: user.id,
      encrypted_content: encryptedContent,
      iv,
      is_anonymous: isAnonymous
    });

  if (error) throw handleAuthError(error);
}

export async function getMessages(
  roomId: string,
  limit: number = 50,
  before?: string
): Promise<ChatMessage[]> {
  const query = supabase
    .from('chat_messages')
    .select(`
      *,
      sender:users(id, full_name)
    `)
    .eq('room_id', roomId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query.lt('created_at', before);
  }

  const { data, error } = await query;
  if (error) throw handleAuthError(error);

  // Decrypt messages
  const decryptedMessages = await Promise.all(
    (data || []).map(async message => ({
      ...message,
      content: await decryptMessage(message.encrypted_content, message.iv)
    }))
  );

  return decryptedMessages;
}

export async function reportMessage(
  messageId: string,
  reason: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('message_reports')
    .insert({
      message_id: messageId,
      reporter_id: user.id,
      reason
    });

  if (error) throw handleAuthError(error);
}

export async function blockUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('blocked_users')
    .insert({
      blocker_id: user.id,
      blocked_id: userId
    });

  if (error) throw handleAuthError(error);
}

export async function unblockUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', userId);

  if (error) throw handleAuthError(error);
}