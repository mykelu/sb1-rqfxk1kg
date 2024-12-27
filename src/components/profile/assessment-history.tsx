import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserAssessments } from '@/lib/api/assessments';
import { formatDateTime } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import type { AssessmentResponse } from '@/types/assessment';

export function AssessmentHistory() {
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const data = await getUserAssessments();
        setAssessments(data.slice(0, 5)); // Show only last 5 assessments
      } catch (error) {
        console.error('Error loading assessments:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAssessments();
  }, []);

  if (loading) {
    return <div>Loading assessment history...</div>;
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">No assessments taken yet</p>
        <Link to="/assessments">
          <Button>Take Your First Assessment</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assessment History</h3>
        <Link to="/assessments">
          <Button variant="outline">View All</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {assessments.map((assessment) => (
          <Link 
            key={assessment.id}
            to={`/assessments/${assessment.type}`}
            className="block"
          >
            <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium capitalize">
                    {assessment.type.replace('_', ' ')} Assessment
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(assessment.createdAt)}
                  </p>
                </div>
                <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {assessment.interpretation}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}