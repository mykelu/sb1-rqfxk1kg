import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDateTime, isValidDate } from '@/lib/utils/date';
import type { AssessmentResponse } from '@/types/assessment';
import { useMemo, useCallback } from 'react';

interface AssessmentResultsProps {
  assessments: AssessmentResponse[];
  templateTitle: string;
}

export function AssessmentResults({ assessments, templateTitle }: AssessmentResultsProps) {
  const validateAssessment = useCallback((assessment: AssessmentResponse) => {
    return (
      assessment &&
      assessment.createdAt &&
      isValidDate(assessment.createdAt)
    );
  }, []);

  const chartData = useMemo(() => {
    return assessments
      .filter(validateAssessment)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(assessment => ({
        label: formatDateTime(assessment.createdAt),
        score: assessment.score,
        timestamp: new Date(assessment.createdAt).getTime()
      }));
  }, [assessments]);

  if (!assessments?.length || !chartData.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No assessment history available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{templateTitle} History</h3>

      <div className="h-64 w-full">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              angle={-45}
              interval={0}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => {
                return value || 'Unknown date';
              }}
              formatter={(value) => [value, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ fill: '#0ea5e9', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {assessments
          .filter(validateAssessment)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((assessment) => (
          <div
            key={assessment.id}
            className="p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium mb-1">
                  Score: {assessment.score}
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
        ))}
      </div>
    </div>
  );
}