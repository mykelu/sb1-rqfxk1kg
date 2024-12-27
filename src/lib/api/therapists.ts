import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import type { TherapistProfile, TherapistFilters } from '@/types/therapist';

export async function getTherapists(filters?: TherapistFilters) {
  let query = supabase
    .from('users')
    .select(`
      id,
      full_name,
      therapist_profiles!inner (
        id,
        bio,
        specializations,
        languages,
        session_rate,
        accepts_insurance,
        rating,
        review_count,
        is_verified
      )
    `)
    .eq('role', 'therapist')
    .eq('therapist_profiles.is_verified', true);

  if (filters) {
    if (filters.specializations?.length) {
      query = query.contains('therapist_profiles.specializations', filters.specializations);
    }
    if (filters.languages?.length) {
      query = query.contains('therapist_profiles.languages', filters.languages);
    }
    if (filters.minRating) {
      query = query.gte('therapist_profiles.rating', filters.minRating);
    }
    if (filters.maxRate) {
      query = query.lte('therapist_profiles.session_rate', filters.maxRate);
    }
    if (filters.acceptsInsurance !== undefined) {
      query = query.eq('therapist_profiles.accepts_insurance', filters.acceptsInsurance);
    }
  }

  const { data, error } = await query.order('therapist_profiles.rating', { ascending: false });
  if (error) throw handleAuthError(error);
  return data || [];
}

export async function getFavoriteTherapists() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('favorite_therapists')
    .select(`
      therapist:therapist_id (
        id,
        full_name,
        therapist_profiles (*)
      )
    `)
    .eq('user_id', user.id);

  if (error) throw handleAuthError(error);
  return data?.map(f => f.therapist) || [];
}

export async function toggleFavoriteTherapist(therapistId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('favorite_therapists')
    .select('*')
    .eq('user_id', user.id)
    .eq('therapist_id', therapistId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('favorite_therapists')
      .delete()
      .eq('user_id', user.id)
      .eq('therapist_id', therapistId);

    if (error) throw handleAuthError(error);
    return false;
  } else {
    const { error } = await supabase
      .from('favorite_therapists')
      .insert({
        user_id: user.id,
        therapist_id: therapistId
      });

    if (error) throw handleAuthError(error);
    return true;
  }
}

export async function getTherapistReviews(therapistId: string) {
  const { data, error } = await supabase
    .from('therapist_reviews')
    .select(`
      *,
      reviewer:reviewer_id (
        full_name
      )
    `)
    .eq('therapist_id', therapistId)
    .order('created_at', { ascending: false });

  if (error) throw handleAuthError(error);
  return data || [];
}

export async function submitReview(
  therapistId: string,
  rating: number,
  review?: string,
  isAnonymous: boolean = false
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('therapist_reviews')
    .insert({
      therapist_id: therapistId,
      reviewer_id: user.id,
      rating,
      review,
      is_anonymous: isAnonymous
    });

  if (error) throw handleAuthError(error);
}