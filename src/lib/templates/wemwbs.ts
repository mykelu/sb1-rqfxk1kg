import type { AssessmentTemplate } from '@/types/assessment';
import { ASSESSMENT_METADATA } from './metadata';

export const WEMWBS_TEMPLATE: AssessmentTemplate = {
  id: 'wemwbs',
  title: 'Warwick-Edinburgh Mental Well-being Scale',
  description: `Below are some statements about feelings and thoughts. Please select the option that best describes your experience of each over the last 2 weeks.\n\nSource: ${ASSESSMENT_METADATA.wemwbs.sourceUrl}`,
  questions: [
    {
      id: '1',
      text: "I've been feeling optimistic about the future",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '2',
      text: "I've been feeling useful",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '3',
      text: "I've been feeling relaxed",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '4',
      text: "I've been feeling interested in other people",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '5',
      text: "I've had energy to spare",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '6',
      text: "I've been dealing with problems well",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '7',
      text: "I've been thinking clearly",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '8',
      text: "I've been feeling good about myself",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '9',
      text: "I've been feeling close to other people",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '10',
      text: "I've been feeling confident",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '11',
      text: "I've been able to make up my own mind about things",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '12',
      text: "I've been feeling loved",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '13',
      text: "I've been interested in new things",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    },
    {
      id: '14',
      text: "I've been feeling cheerful",
      options: [
        { value: 1, label: 'None of the time' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Some of the time' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'All of the time' }
      ]
    }
  ],
  scoring: {
    ranges: [
      { min: 14, max: 32, label: 'Low', description: 'Low mental well-being' },
      { min: 33, max: 52, label: 'Moderate', description: 'Moderate mental well-being' },
      { min: 53, max: 70, label: 'High', description: 'High mental well-being' }
    ]
  }
};