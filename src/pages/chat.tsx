import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { ChatRoom } from '@/components/chat/chat-room';
import { ChatMenu } from '@/components/chat/chat-menu';
import { useAuth } from '@/lib/auth/auth-context';
import { getChatRooms } from '@/lib/api/chat';
import type { ChatRoom as ChatRoomType } from '@/types/chat';
import { Home, ChevronRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ChatPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getChatRooms();
        setRooms(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load chat rooms:', err);
        setError('Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">Chat</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MessageSquare className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Your active chat sessions and support conversations
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[300px,1fr] gap-6">
            <aside className="bg-white p-4 rounded-lg shadow-sm h-fit">
              <ChatMenu
                rooms={rooms}
                loading={loading}
                error={error}
              />
            </aside>
            
            <main className="bg-white rounded-lg shadow-sm">
              {roomId ? (
                <ChatRoom roomId={roomId} />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Select a chat room to start messaging
                </div>
              )}
            </main>
          </div>
        </div>
      </main>
    </div>
  );
}