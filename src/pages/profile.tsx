import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileCard } from '@/components/profile/profile-card';
import { AssessmentHistory } from '@/components/profile/assessment-history';
import { MentalHealthPreferences } from '@/components/profile/mental-health-preferences';
import { MedicationHistory } from '@/components/profile/medication-history';
import { getUserProfile, updateUserProfile } from '@/lib/profile';
import type { UserProfile } from '@/types/profile';

const profileSchema = z.object({
  pronouns: z.string().optional(),
  location: z.object({
    country: z.string(),
    state: z.string().optional(),
    city: z.string(),
    timezone: z.string(),
  }),
  preferences: z.object({
    communicationPreference: z.enum(['chat', 'video', 'in-person']),
    therapistGenderPreference: z.enum(['male', 'female', 'any']).optional(),
    specializations: z.array(z.string()).optional(),
    languagePreference: z.array(z.string()),
    emergencyContactConsent: z.boolean(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data);
        if (data) {
          reset(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updated = await updateUserProfile(data);
      setProfile(updated);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-healing)' }}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-6 md:grid-cols-[1fr,2fr]">
            <div>
              <ProfileCard profile={profile} />
            </div>
            <div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="mb-8">
                  <AssessmentHistory />
                  <div className="mt-8 pt-8 border-t">
                    <MedicationHistory initialData={profile?.healthHistory} />
                  </div>
                  <div className="mt-8 pt-8 border-t">
                    <MentalHealthPreferences initialData={profile?.preferences} />
                  </div>
                </div>
                <div className="border-t pt-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Basic Information</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pronouns">Pronouns</Label>
                          <Input
                            id="pronouns"
                            {...register('pronouns')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Location</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            {...register('location.country')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            {...register('location.city')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Preferences</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="communicationPreference">
                            Preferred Communication
                          </Label>
                          <select
                            id="communicationPreference"
                            {...register('preferences.communicationPreference')}
                            className="w-full rounded-md border border-input"
                          >
                            <option value="chat">Chat</option>
                            <option value="video">Video</option>
                            <option value="in-person">In-person</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}