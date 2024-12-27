import { useState, useEffect } from 'react';
import { getUserName } from '@/lib/api/user';

export function UserGreeting() {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserName() {
      try {
        setLoading(true);
        const userName = await getUserName();
        setName(userName);
      } catch (error) {
        console.error('Error loading user name:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserName();
  }, []);

  if (loading) {
    return null;
  }

  if (!name) return null;

  return (
    <div className="text-sm font-medium text-gray-600">
      Welcome back, {name}
    </div>
  );
}