import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '@/lib/api/profile';
import type { ProfileUpdateData } from '@/types/profile';

const profileSchema = z.object({
  pronouns: z.string().optional(),
  location: z.object({
    country: z.string().min(1, 'Country is required'),
    state: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    timezone: z.string().min(1, 'Timezone is required'),
  }),
  preferences: z.object({
    communicationPreference: z.enum(['chat', 'video', 'in-person']),
    therapistGenderPreference: z.enum(['male', 'female', 'any']).optional(),
    languagePreference: z.array(z.string()).min(1, 'Select at least one language'),
    emergencyContactConsent: z.boolean(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSuccess?: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateProfile(data as ProfileUpdateData);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pronouns">Pronouns</Label>
          <Input
            id="pronouns"
            {...register('pronouns')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register('location.country')}
            disabled={isLoading}
          />
          {errors.location?.country && (
            <p className="text-sm text-destructive">{errors.location.country.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="communicationPreference">Preferred Communication</Label>
          <select
            id="communicationPreference"
            {...register('preferences.communicationPreference')}
            className="w-full rounded-md border border-input px-3 py-2"
            disabled={isLoading}
          >
            <option value="chat">Chat</option>
            <option value="video">Video</option>
            <option value="in-person">In-person</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emergencyContactConsent"
            {...register('preferences.emergencyContactConsent')}
            className="rounded border-gray-300"
            disabled={isLoading}
          />
          <Label htmlFor="emergencyContactConsent">
            I consent to providing emergency contact information
          </Label>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}