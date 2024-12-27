import { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import { AssessmentForm } from '@/components/assessment/assessment-form';
import { AssessmentResults } from '@/components/assessment/assessment-results';
import { Button } from '@/components/ui/button';
import { PHQ9_TEMPLATE, GAD7_TEMPLATE, WHO5_TEMPLATE, WEMWBS_TEMPLATE } from '@/lib/templates';
import { getUserAssessments } from '@/lib/api/assessments';
import type { AssessmentResult, AssessmentResponse } from '@/types/assessment';

const TEMPLATES = {
  phq9: PHQ9_TEMPLATE,
  gad7: GAD7_TEMPLATE,
  who5: WHO5_TEMPLATE,
  wemwbs: WEMWBS_TEMPLATE
} as const;

export function AssessmentsPage() {
  const { type } = useParams();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssessments = useCallback(async () => {
    if (!user || !type) return;
    
    try {
      const data = await getUserAssessments(type as keyof typeof TEMPLATES);
      setAssessments(data);
      setError(null);
    } catch (error) {
      console.error('Error loading assessments:', error);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, [type, user]);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  // Redirect to PHQ-9 if no assessment type is selected
  if (!type) {
    return <Navigate to="/assessments/phq9" replace />;
  }

  // Validate assessment type
  const template = TEMPLATES[type as keyof typeof TEMPLATES];
  if (!template) {
    return <Navigate to="/assessments/phq9" replace />;
  }

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setShowForm(false);
    // Refresh assessments list
    loadAssessments();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{template.title}</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Take New Assessment
          </Button>
        )}
      </div>

      {error && (
        <div className="text-center py-4 text-red-600">
          {error}
        </div>
      )}

      {showForm ? (
        <AssessmentForm
          template={template}
          onComplete={handleAssessmentComplete}
        />
      ) : loading ? (
        <div className="text-center py-12">Loading assessments...</div>
      ) : (
        <AssessmentResults
          assessments={assessments}
          templateTitle={template.title}
        />
      )}
    </div>
  );
}