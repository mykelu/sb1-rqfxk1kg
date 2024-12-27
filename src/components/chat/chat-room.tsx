import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { ChatWindow } from './chat-window';
import { getMessages, reportMessage } from '@/lib/api/chat';
import type { ChatMessage } from '@/types/chat';

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      try {
        const data = await getMessages(roomId);
        if (mounted) {
          setMessages(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        if (mounted) {
          setError('Failed to load messages');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [roomId]);

  const handleReport = async (messageId: string) => {
    try {
      await reportMessage(messageId, 'Inappropriate content');
      // Show success message
    } catch (error) {
      console.error('Failed to report message:', error);
      // Show error message
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading messages...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="h-[600px] bg-background rounded-lg shadow-sm">
      <ChatWindow
        roomId={roomId}
        messages={messages}
        onReport={handleReport}
      />
    </div>
  );
}