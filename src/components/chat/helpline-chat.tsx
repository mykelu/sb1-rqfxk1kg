import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatRoom } from './chat-room';
import { supabase } from '@/lib/supabase';
import { createChatRoom } from '@/lib/api/chat';
import { MessageSquare, AlertCircle } from 'lucide-react';

export function HelplineChat() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startChat = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to start a chat');
      }
      
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) {
        throw new Error('User profile not found');
      }
        
      const newRoomId = await createChatRoom('crisis_support', userData.id);
      setRoomId(newRoomId);
    } catch (err) {
      console.error('Failed to create chat room:', err);
      setError(err instanceof Error ? err.message : 'No support agents available. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (roomId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg font-semibold">Crisis Support Chat</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRoomId(null)}
          >
            End Chat
          </Button>
        </div>
        <ChatRoom roomId={roomId} />
      </div>
    );
  }

  return (
    <Card className="p-6 text-center space-y-4">
      <MessageSquare className="h-12 w-12 mx-auto text-primary" />
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Start Crisis Support Chat
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect with a crisis support responder immediately. All conversations are private and secure.
        </p>
        <Button
          onClick={startChat}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Connecting...' : 'Start Chat Now'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </Card>
  );
}