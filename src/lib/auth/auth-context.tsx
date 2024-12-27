import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { getUserRole, createUserRecord } from './auth-utils';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isLoading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const resetState = () => {
    setUser(null);
    setUserRole(null);
    setError(null);
  };

  async function fetchUserRole(authId: string) {
    try {
      let role = await getUserRole(authId);
      if (!role && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchUserRole(authId), 1000);
        return;
      }
      setUserRole(role || 'adult');
    } catch (err) {
      console.error('Error fetching user role:', err);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchUserRole(authId), 1000);
      } else {
        setError('Failed to fetch user role');
        resetState();
      }
    }
  }

  useEffect(() => {
    async function initSession() {
      setIsLoading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          resetState();
        }
      } catch (err) {
        console.error('Error initializing session:', err);
        resetState();
        setError('Failed to initialize session');
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isInitialized) return;
        setIsLoading(true);

        try {
          if (session?.user) {
            setUser(session.user);
            await fetchUserRole(session.user.id);
          } else {
            resetState();
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          resetState();
          setError('Authentication error occurred');
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized]);
  
  return (
    <AuthContext.Provider value={{ user, userRole, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}