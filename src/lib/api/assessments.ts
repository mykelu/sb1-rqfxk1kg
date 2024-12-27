import { supabase } from '../supabase';
import { handleAuthError } from '../auth/auth-utils';
import type { AssessmentType, AssessmentResult, AssessmentResponse } from '@/types/assessment';
import { PHQ9_TEMPLATE, GAD7_TEMPLATE, WHO5_TEMPLATE, WEMWBS_TEMPLATE } from '../templates';
import { formatToGMT8 } from '@/lib/utils/date';

const TEMPLATES = {
  phq9: PHQ9_TEMPLATE,
  gad7: GAD7_TEMPLATE,
  who5: WHO5_TEMPLATE,
  wemwbs: WEMWBS_TEMPLATE
} as const;

export async function submitAssessment(
  templateId: AssessmentType,
  answers: Record<string, number>
): Promise<AssessmentResult> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Calculate score and interpretation
    const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const template = TEMPLATES[templateId];
    if (!template) throw new Error('Invalid assessment type');

    const interpretation = template.scoring.ranges.find(
      range => score >= range.min && score <= range.max
    )?.label || 'Unknown';

    // Insert assessment with proper timestamp
    const { data: newUser, error: insertError } = await supabase
      .from('assessments')
      .insert({
        user_id: user.id,
        type: templateId,
        answers,
        score,
        interpretation,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting assessment:', insertError);
      throw handleAuthError(insertError);
    }

    return {
      score,
      interpretation,
      recommendations: getRecommendations(score, templateId)
    };
  } catch (error) {
    console.error('Assessment submission error:', error);
    throw error;
  }
}

export async function getUserAssessments(
  templateId?: AssessmentType
): Promise<AssessmentResponse[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const query = supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (templateId) {
      query.eq('type', templateId);
    }

    const { data, error } = await query;
    if (error) throw handleAuthError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching assessments:', error);
    throw error;
  }
}

function getRecommendations(score: number, templateId: AssessmentType): string[] {
  // Add template-specific recommendations based on score
  const recommendations: string[] = [];
  
  switch (templateId) {
    case 'phq9':
      if (score >= 15) {
        recommendations.push('Consider scheduling an appointment with a mental health professional');
        recommendations.push('Reach out to your support network');
      } else if (score >= 10) {
        recommendations.push('Practice self-care activities');
        recommendations.push('Consider talking to a counselor');
      } else {
        recommendations.push('Continue monitoring your mood');
        recommendations.push('Maintain healthy lifestyle habits');
      }
      break;

    case 'gad7':
      if (score >= 15) {
        recommendations.push('Consider consulting with an anxiety specialist');
        recommendations.push('Learn and practice relaxation techniques');
      } else if (score >= 10) {
        recommendations.push('Try mindfulness or meditation exercises');
        recommendations.push('Consider speaking with a counselor');
      } else {
        recommendations.push('Practice stress management techniques');
        recommendations.push('Maintain regular exercise routine');
      }
      break;

    case 'who5':
      if (score <= 32) {
        recommendations.push('Consider speaking with a mental health professional');
        recommendations.push('Focus on activities that bring you joy');
      } else if (score <= 50) {
        recommendations.push('Build a daily routine with enjoyable activities');
        recommendations.push('Consider lifestyle changes to improve well-being');
      } else {
        recommendations.push('Continue your positive lifestyle habits');
        recommendations.push('Share your well-being strategies with others');
      }
      break;
      
    case 'wemwbs':
      if (score <= 32) {
        recommendations.push('Consider speaking with a mental health professional');
        recommendations.push('Focus on activities that promote well-being');
      } else if (score <= 52) {
        recommendations.push('Continue building positive relationships and activities');
        recommendations.push('Practice self-care and mindfulness');
      } else {
        recommendations.push('Maintain your positive mental well-being practices');
        recommendations.push('Consider mentoring others in well-being strategies');
      }
      break;
  }
  
  return recommendations;
}