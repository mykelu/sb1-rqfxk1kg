import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { submitAssessment } from '@/lib/api/assessments';
import type { AssessmentTemplate, AssessmentResult } from '@/types/assessment';

interface AssessmentFormProps {
  template: AssessmentTemplate;
  onComplete?: (result: AssessmentResult) => void;
}

export function AssessmentForm({ template, onComplete }: AssessmentFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitAssessment(template.id, answers);
      onComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-teal-900">{template.title}</h2>
          <p className="mt-2 text-teal-700">{template.description}</p>
        </div>

        {template.questions.map((question) => (
          <div key={question.id} className="space-y-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Label className="block text-base">{question.text}</Label>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    onChange={(e) => setAnswers({
                      ...answers,
                      [question.id]: Number(e.target.value)
                    })}
                    className="rounded-full text-teal-600 focus:ring-teal-500"
                    required
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
      </Button>
    </form>
  );
}