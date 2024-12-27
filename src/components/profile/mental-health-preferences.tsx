import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updatePreferences } from '@/lib/api/profile';

const preferencesSchema = z.object({
  communicationPreference: z.enum(['chat', 'video', 'in-person']),
  therapistGenderPreference: z.enum(['male', 'female', 'any']),
  specializations: z.array(z.string()),
  languagePreference: z.array(z.string()),
  emergencyContactConsent: z.boolean(),
  treatmentGoals: z.array(z.string()),
  previousTherapyExperience: z.boolean(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const SPECIALIZATIONS = [
  'Anxiety',
  'Depression',
  'Trauma',
  'Relationships',
  'Stress Management',
  'Self-Esteem',
  'Grief',
  'Life Transitions'
];

const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Hindi', 'Arabic'];

export function MentalHealthPreferences({ initialData }: { initialData?: Partial<PreferencesFormData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      await updatePreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Therapy Preferences</h3>
        
        <div className="space-y-2">
          <Label>Preferred Communication Method</Label>
          <select
            {...register('communicationPreference')}
            className="w-full rounded-md border border-input p-2"
          >
            <option value="chat">Chat</option>
            <option value="video">Video Call</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Therapist Gender Preference</Label>
          <select
            {...register('therapistGenderPreference')}
            className="w-full rounded-md border border-input p-2"
          >
            <option value="any">No Preference</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Areas of Focus</Label>
          <div className="grid grid-cols-2 gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <label key={spec} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={spec}
                  {...register('specializations')}
                  className="rounded border-gray-300"
                />
                <span>{spec}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preferred Languages</Label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <label key={lang} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={lang}
                  {...register('languagePreference')}
                  className="rounded border-gray-300"
                />
                <span>{lang}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('emergencyContactConsent')}
              className="rounded border-gray-300"
            />
            <span>I consent to providing emergency contact information</span>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full">Save Preferences</Button>
    </form>
  );
}