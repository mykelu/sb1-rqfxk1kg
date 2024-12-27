import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications, updateNotificationStatus } from '@/lib/api/notifications';
import type { AssessmentNotification } from '@/types/notification';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AssessmentNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data.filter(n => n.status === 'pending'));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  const handleNotificationClick = async (notification: AssessmentNotification) => {
    try {
      await updateNotificationStatus(notification.id, 'read');
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setShowDropdown(false);
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>

      {showDropdown && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                to="/assessments"
                onClick={() => handleNotificationClick(notification)}
                className="block p-3 hover:bg-gray-50 rounded-md transition-colors"
              >
                <p className="font-medium text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}