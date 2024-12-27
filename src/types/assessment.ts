export type AssessmentType = 'phq9' | 'gad7' | 'who5' | 'wemwbs';

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: {
    value: number;
    label: string;
  }[];
}

export interface AssessmentTemplate {
  id: AssessmentType;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  scoring: {
    ranges: {
      min: number;
      max: number;
      label: string;
      description: string;
    }[];
  };
}

export interface AssessmentResponse {
  id: string;
  userId: string;
  templateId: AssessmentType;
  answers: Record<string, number>;
  score: number;
  interpretation: string;
  createdAt: string;
}

export interface AssessmentResult {
  score: number;
  interpretation: string;
  recommendations: string[];
}</boltArtifact>

<boltAction type="file" filePath="src/lib/templates/phq9.ts" contentType="content">import type { AssessmentTemplate } from '@/types/assessment';

export const PHQ9_TEMPLATE: AssessmentTemplate = {
  id: 'phq9',
  title: 'PHQ-9 Depression Assessment',
  description: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  questions: [
    {
      id: '1',
      text: 'Little interest or pleasure in doing things',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '2',
      text: 'Feeling down, depressed, or hopeless',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
    // Add remaining questions...
  ],
  scoring: {
    ranges: [
      { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression' },
      { min: 5, max: 9, label: 'Mild', description: 'Mild depression' },
      { min: 10, max: 14, label: 'Moderate', description: 'Moderate depression' },
      { min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression' },
      { min: 20, max: 27, label: 'Severe', description: 'Severe depression' }
    ]
  }
};