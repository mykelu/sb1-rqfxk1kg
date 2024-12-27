import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateHealthHistory } from '@/lib/api/profile';
import type { HealthHistory } from '@/types/profile';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

export function MedicationHistory({ initialData }: { initialData?: HealthHistory }) {
  const [medications, setMedications] = useState(initialData?.medications || []);
  const [isAddingMedication, setIsAddingMedication] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
  });

  const onSubmit = async (data: MedicationFormData) => {
    try {
      const updatedMedications = [...medications, data];
      await updateHealthHistory({ medications: updatedMedications });
      setMedications(updatedMedications);
      setIsAddingMedication(false);
      reset();
    } catch (error) {
      console.error('Error updating medications:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Medication History</h3>
        <Button
          variant="outline"
          onClick={() => setIsAddingMedication(!isAddingMedication)}
        >
          {isAddingMedication ? 'Cancel' : 'Add Medication'}
        </Button>
      </div>

      {isAddingMedication && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medication Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" {...register('dosage')} />
              {errors.dosage && (
                <p className="text-sm text-destructive">{errors.dosage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input id="frequency" {...register('frequency')} />
              {errors.frequency && (
                <p className="text-sm text-destructive">{errors.frequency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input type="date" id="endDate" {...register('endDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" {...register('notes')} />
            </div>
          </div>

          <Button type="submit">Add Medication</Button>
        </form>
      )}

      <div className="space-y-4">
        {medications.map((med, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{med.name}</h4>
                <p className="text-sm text-gray-600">
                  {med.dosage} - {med.frequency}
                </p>
                <p className="text-sm text-gray-600">
                  Started: {new Date(med.startDate).toLocaleDateString()}
                  {med.endDate && ` - Ended: ${new Date(med.endDate).toLocaleDateString()}`}
                </p>
              </div>
              {med.notes && (
                <p className="text-sm text-gray-600 italic">
                  {med.notes}
                </p>
              )}
            </div>
          </div>
        ))}

        {medications.length === 0 && !isAddingMedication && (
          <p className="text-center text-gray-600">No medications recorded</p>
        )}
      </div>
    </div>
  );
}