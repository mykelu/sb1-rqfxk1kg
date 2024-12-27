import type { AssessmentTemplate } from '@/types/assessment';
import { ASSESSMENT_METADATA } from './metadata';

export const PHQ9_TEMPLATE: AssessmentTemplate = {
  id: 'phq9',
  title: 'PHQ-9 Depression Assessment',
  description: `Over the last 2 weeks, how often have you been bothered by any of the following problems?\n\nSource: ${ASSESSMENT_METADATA.phq9.sourceUrl}`,
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
    },
    {
      id: '3',
      text: 'Trouble falling or staying asleep, or sleeping too much',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '4',
      text: 'Feeling tired or having little energy',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '5',
      text: 'Poor appetite or overeating',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '6',
      text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '7',
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '8',
      text: 'Moving or speaking so slowly that other people could have noticed - or the opposite, being so fidgety or restless that you have been moving around a lot more than usual',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: '9',
      text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
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
      { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression' },
      { min: 5, max: 9, label: 'Mild', description: 'Mild depression' },
      { min: 10, max: 14, label: 'Moderate', description: 'Moderate depression' },
      { min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression' },
      { min: 20, max: 27, label: 'Severe', description: 'Severe depression' }
    ]
  }
};