import type { AssessmentTemplate } from '@/types/assessment';
import { ASSESSMENT_METADATA } from './metadata';

export const GAD7_TEMPLATE: AssessmentTemplate = {
  id: 'gad7',
  title: 'GAD-7 Anxiety Assessment',
  description: `Over the last 2 weeks, how often have you been bothered by the following problems?\n\nSource: ${ASSESSMENT_METADATA.gad7.sourceUrl}`,
  questions: [
    {
      id: '1',
      text: 'Feeling nervous, anxious, or on edge',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '2',
      text: 'Not being able to stop or control worrying',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '3',
      text: 'Worrying too much about different things',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '4',
      text: 'Trouble relaxing',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '5',
      text: 'Being so restless that it is hard to sit still',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '6',
      text: 'Becoming easily annoyed or irritable',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '7',
      text: 'Feeling afraid as if something awful might happen',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
  ],
  scoring: {
    ranges: [
      { min: 0, max: 4, label: 'Minimal', description: 'Minimal anxiety' },
      { min: 5, max: 9, label: 'Mild', description: 'Mild anxiety' },
      { min: 10, max: 14, label: 'Moderate', description: 'Moderate anxiety' },
      { min: 15, max: 21, label: 'Severe', description: 'Severe anxiety' }
    ]
  }
};