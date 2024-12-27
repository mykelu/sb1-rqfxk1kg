import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import type { ChatRoom } from '@/types/chat';

interface ChatMenuProps {
  rooms: ChatRoom[];
  loading?: boolean;
  error?: string | null;
}

export function ChatMenu({ rooms, loading, error }: ChatMenuProps) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading chat rooms...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No active chat rooms
      </div>
    );
  }

  return (
    <nav className="space-y-2">
      {rooms.map((room) => {
        const isActive = location.pathname === `/chat/${room.id}`;
        const participant = room.participants.find(p => p.role !== 'client');
        
        return (
          <Link
            key={room.id}
            to={`/chat/${room.id}`}
            className="block w-full"
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 p-3 h-auto",
                isActive && "bg-accent"
              )}
            >
              <div className="flex-shrink-0">
                {room.type === 'crisis_support' ? (
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-primary" />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="font-medium">
                  {room.type === 'crisis_support' ? 'Crisis Support' : 'Therapy Session'}
                </div>
                {participant && (
                  <div className="text-sm text-muted-foreground">
                    with {participant.role === 'therapist' ? 'Therapist' : 'Support Team'}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(room.updated_at).toLocaleDateString()}
              </div>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}