import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createConsent } from '@/lib/consent';
import type { ConsentType } from '@/types/consent';

const consentSchema = z.object({
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianRelationship: z.string().min(1, 'Relationship is required'),
  guardianEmail: z.string().email('Invalid email address'),
  guardianPhone: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val, 'You must accept the terms'),
  privacyAccepted: z.boolean().refine(val => val, 'You must accept the privacy policy'),
  additionalNotes: z.string().optional(),
});

type ConsentFormData = z.infer<typeof consentSchema>;

interface ConsentFormProps {
  minorId: string;
  consentType: ConsentType;
  onSuccess?: () => void;
}

export function ConsentForm({ minorId, consentType, onSuccess }: ConsentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
  });

  const onSubmit = async (data: ConsentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await createConsent(
        minorId,
        consentType,
        {
          name: data.guardianName,
          relationship: data.guardianRelationship,
          email: data.guardianEmail,
          phone: data.guardianPhone,
        },
        {
          termsAccepted: data.termsAccepted,
          privacyAccepted: data.privacyAccepted,
          additionalNotes: data.additionalNotes,
        }
      );
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guardianName">Guardian's Full Name</Label>
          <Input
            id="guardianName"
            {...register('guardianName')}
            disabled={isLoading}
          />
          {errors.guardianName && (
            <p className="text-sm text-destructive">{errors.guardianName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianRelationship">Relationship to Minor</Label>
          <Input
            id="guardianRelationship"
            {...register('guardianRelationship')}
            disabled={isLoading}
          />
          {errors.guardianRelationship && (
            <p className="text-sm text-destructive">{errors.guardianRelationship.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianEmail">Email Address</Label>
          <Input
            id="guardianEmail"
            type="email"
            {...register('guardianEmail')}
            disabled={isLoading}
          />
          {errors.guardianEmail && (
            <p className="text-sm text-destructive">{errors.guardianEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianPhone">Phone Number (Optional)</Label>
          <Input
            id="guardianPhone"
            type="tel"
            {...register('guardianPhone')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="termsAccepted"
              {...register('termsAccepted')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="termsAccepted">
              I agree to the terms and conditions
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="privacyAccepted"
              {...register('privacyAccepted')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="privacyAccepted">
              I agree to the privacy policy
            </Label>
          </div>
          {errors.privacyAccepted && (
            <p className="text-sm text-destructive">{errors.privacyAccepted.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
          <textarea
            id="additionalNotes"
            {...register('additionalNotes')}
            className="w-full rounded-md border border-input px-3 py-2"
            rows={4}
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Consent Form'}
      </Button>
    </form>
  );
}