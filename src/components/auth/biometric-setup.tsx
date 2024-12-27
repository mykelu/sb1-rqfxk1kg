import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { isBiometricAvailable, enrollBiometric } from '@/lib/auth/biometric';
import { supabase } from '@/lib/supabase';

export function BiometricSetup() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAvailability();
  }, []);

  async function checkAvailability() {
    const available = await isBiometricAvailable();
    setIsAvailable(available);
  }

  async function handleEnroll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      await enrollBiometric(user.id);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!isAvailable) {
    return (
      <div className="text-sm text-muted-foreground">
        Biometric authentication is not available on this device.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Enable Biometric Login</h2>
      <p className="text-sm text-muted-foreground">
        Use your device's biometric authentication (fingerprint or Face ID) for quick and secure login.
      </p>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button onClick={handleEnroll}>
        Set up biometric login
      </Button>
    </div>
  );
}