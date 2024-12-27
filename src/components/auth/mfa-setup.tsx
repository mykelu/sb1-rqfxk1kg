import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { enrollMFA, verifyMFA } from '@/lib/auth/mfa';

export function MFASetup() {
  const [step, setStep] = useState<'initial' | 'verify'>('initial');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    try {
      const { id, totp } = await enrollMFA(factorId);
      setFactorId(id);
      setQrCode(totp.qr_code);
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      await verifyMFA(factorId, code);
      // Handle success
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (step === 'initial') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Enable Two-Factor Authentication</h2>
        <Button onClick={handleEnroll}>Set up 2FA</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Verify Two-Factor Authentication</h2>
      {qrCode && (
        <div className="flex justify-center">
          <img src={qrCode} alt="QR Code for 2FA" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="code">Enter verification code</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button onClick={handleVerify}>Verify</Button>
    </div>
  );
}