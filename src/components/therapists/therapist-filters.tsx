import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { TherapistFilters as FilterOptions, TherapistSpecialization } from '@/types/therapist';

const SPECIALIZATIONS: TherapistSpecialization[] = [
  'anxiety',
  'depression',
  'trauma',
  'relationships',
  'addiction',
  'grief',
  'stress',
  'eating_disorders',
  'family',
  'youth'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic'];

interface TherapistFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
}

export function TherapistFilters({ filters, onChange }: TherapistFiltersProps) {
  const handleSpecializationChange = (spec: TherapistSpecialization) => {
    const current = filters.specializations || [];
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    
    onChange({
      ...filters,
      specializations: updated
    });
  };

  const handleLanguageChange = (lang: string) => {
    const current = filters.languages || [];
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    
    onChange({
      ...filters,
      languages: updated
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-medium mb-4">Specializations</h3>
        <div className="space-y-2">
          {SPECIALIZATIONS.map((spec) => (
            <label key={spec} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.specializations?.includes(spec)}
                onChange={() => handleSpecializationChange(spec)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">
                {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Languages</h3>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <label key={lang} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.languages?.includes(lang)}
                onChange={() => handleLanguageChange(lang)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Session Rate</h3>
        <div className="space-y-4">
          <div>
            <Label>Maximum Rate (per session)</Label>
            <Input
              type="number"
              min="0"
              step="10"
              value={filters.maxRate || ''}
              onChange={(e) => onChange({
                ...filters,
                maxRate: e.target.value ? Number(e.target.value) : undefined
              })}
            />
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.acceptsInsurance}
              onChange={(e) => onChange({
                ...filters,
                acceptsInsurance: e.target.checked
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Accepts Insurance</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Rating</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={filters.minRating || ''}
              onChange={(e) => onChange({
                ...filters,
                minRating: e.target.value ? Number(e.target.value) : undefined
              })}
              className="w-20 rounded-md border border-input px-3 py-1"
            />
            <span className="text-sm">Minimum Rating</span>
          </label>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => onChange({})}
      >
        Clear Filters
      </Button>
    </Card>
  );
}