import type { AssessmentTemplate } from '@/types/assessment';
import { ASSESSMENT_METADATA } from './metadata';

export const WHO5_TEMPLATE: AssessmentTemplate = {
  id: 'who5',
  title: 'WHO-5 Well-Being Index',
  description: `Over the last 2 weeks, how often have you felt the following?\n\nSource: ${ASSESSMENT_METADATA.who5.sourceUrl}`,
  questions: [
    {
      id: '1',
      text: 'I have felt cheerful and in good spirits',
      options: [
        { value: 0, label: 'At no time' },
        { value: 1, label: 'Some of the time' },
        { value: 2, label: 'Less than half of the time' },
        { value: 3, label: 'More than half of the time' },
        { value: 4, label: 'Most of the time' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '2',
      text: 'I have felt calm and relaxed',
      options: [
        { value: 0, label: 'At no time' },
        { value: 1, label: 'Some of the time' },
        { value: 2, label: 'Less than half of the time' },
        { value: 3, label: 'More than half of the time' },
        { value: 4, label: 'Most of the time' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '3',
      text: 'I have felt active and vigorous',
      options: [
        { value: 0, label: 'At no time' },
        { value: 1, label: 'Some of the time' },
        { value: 2, label: 'Less than half of the time' },
        { value: 3, label: 'More than half of the time' },
        { value: 4, label: 'Most of the time' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '4',
      text: 'I woke up feeling fresh and rested',
      options: [
        { value: 0, label: 'At no time' },
        { value: 1, label: 'Some of the time' },
        { value: 2, label: 'Less than half of the time' },
        { value: 3, label: 'More than half of the time' },
        { value: 4, label: 'Most of the time' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '5',
      text: 'My daily life has been filled with things that interest me',
      options: [
        { value: 0, label: 'At no time' },
        { value: 1, label: 'Some of the time' },
        { value: 2, label: 'Less than half of the time' },
        { value: 3, label: 'More than half of the time' },
        { value: 4, label: 'Most of the time' },
        { value: 5, label: 'All of the time' }
      ]
    }
  ],
  scoring: {
    ranges: [
      { min: 0, max: 32, label: 'Low', description: 'Low well-being' },
      { min: 33, max: 50, label: 'Moderate', description: 'Moderate well-being' },
      { min: 51, max: 100, label: 'High', description: 'High well-being' }
    ]
  }
};