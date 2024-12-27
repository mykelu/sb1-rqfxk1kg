import { User, Mail, MapPin, Calendar } from 'lucide-react';
import type { UserProfile } from '@/types/profile';

interface ProfileCardProps {
  profile: UserProfile | null;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-rose-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-teal-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">{profile?.pronouns || 'Set your pronouns'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-gray-600">
          <Mail className="w-5 h-5 text-teal-500" />
          <span>{profile?.email || 'Add email'}</span>
        </div>

        <div className="flex items-center space-x-3 text-gray-600">
          <MapPin className="w-5 h-5 text-teal-500" />
          <span>
            {profile?.location?.city && profile?.location?.country
              ? `${profile.location.city}, ${profile.location.country}`
              : 'Add location'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-gray-600">
          <Calendar className="w-5 h-5 text-teal-500" />
          <span>Member since {new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}