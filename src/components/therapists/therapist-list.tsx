import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTherapists, toggleFavoriteTherapist } from '@/lib/api/therapists';
import { Star, Calendar, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TherapistFilters } from '@/types/therapist';

interface TherapistListProps {
  filters: TherapistFilters;
}

export function TherapistList({ filters }: TherapistListProps) {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTherapists() {
      try {
        const data = await getTherapists(filters);
        setTherapists(data);
        setError(null);
      } catch (err) {
        console.error('Error loading therapists:', err);
        setError('Failed to load therapists');
      } finally {
        setLoading(false);
      }
    }

    loadTherapists();
  }, [filters]);

  const handleFavorite = async (therapistId: string) => {
    try {
      await toggleFavoriteTherapist(therapistId);
      // Refresh list to update favorite status
      const data = await getTherapists(filters);
      setTherapists(data);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading therapists...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {therapists.map((therapist) => (
        <Card key={therapist.id} className="p-6">
          <div className="flex justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{therapist.full_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{therapist.therapist_profiles[0].rating.toFixed(1)}</span>
                  <span>({therapist.therapist_profiles[0].review_count} reviews)</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm line-clamp-2">{therapist.therapist_profiles[0].bio}</p>
                
                <div className="flex flex-wrap gap-2">
                  {therapist.therapist_profiles[0].specializations.map((spec: string) => (
                    <span
                      key={spec}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                    >
                      {spec.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link to={`/appointments?therapist=${therapist.id}`}>
                  <Button className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Session
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFavorite(therapist.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      therapist.is_favorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold">
                ${therapist.therapist_profiles[0].session_rate}/session
              </p>
              {therapist.therapist_profiles[0].accepts_insurance && (
                <p className="text-sm text-gray-600">Accepts Insurance</p>
              )}
            </div>
          </div>
        </Card>
      ))}

      {therapists.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No therapists found matching your criteria
        </div>
      )}
    </div>
  );
}