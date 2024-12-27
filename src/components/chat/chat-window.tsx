import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, AlertTriangle, MoreVertical } from 'lucide-react';
import { sendMessage, reportMessage } from '@/lib/api/chat';
import type { ChatMessage } from '@/types/chat';
import { formatDateTime } from '@/lib/utils/date';

interface ChatWindowProps {
  roomId: string;
  messages: ChatMessage[];
  onReport?: (messageId: string) => void;
}

export function ChatWindow({ roomId, messages, onReport }: ChatWindowProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(roomId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender_id === user?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {!message.is_anonymous && message.sender && (
                <div className="text-xs opacity-70 mb-1">
                  {message.sender.full_name}
                </div>
              )}
              <div className="break-words">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {formatDateTime(message.created_at)}
              </div>
            </div>

            {message.sender_id !== user?.id && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 hover:opacity-100 ml-2"
                onClick={() => onReport?.(message.id)}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}