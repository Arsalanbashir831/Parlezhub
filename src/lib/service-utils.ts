import { z } from 'zod';

import {
  ServiceStatus,
  ServiceType,
} from '@/types/service';


/** One gig, one set of rules: every composer that writes a gig — the
 *  observatory's and the workspace's — validates against this schema. */
export const gigFormSchema = z.object({
  type: z.enum(['language', 'astrology', 'general']),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(80, 'Title must not exceed 80 characters'),
  description: z
    .string()
    .min(100, 'Description must be at least 100 characters')
    .max(1200, 'Description must not exceed 1200 characters'),
  shortDescription: z
    .string()
    .min(20, 'Short description must be at least 20 characters')
    .max(160, 'Short description must not exceed 160 characters'),
  price: z
    .number()
    .min(5, 'Price must be at least $5')
    .max(1000, 'Price must not exceed $1000'),
  duration: z
    .number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(300, 'Duration must not exceed 5 hours'),
  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed'),
  whatYouProvide: z
    .array(z.string())
    .min(1, 'At least one service item is required')
    .max(10, 'Maximum 10 service items allowed'),
});

export type GigFormValues = z.infer<typeof gigFormSchema>;

/** One-tap starting points; a consultant who has never written a gig should not
 *  have to invent the vocabulary for it. */
export const TAG_SUGGESTIONS: Record<ServiceType, string[]> = {
  astrology: [
    'Natal chart',
    'Kundli',
    'Dasha timing',
    'Career',
    'Marriage',
    'Remedies',
  ],
  language: [
    'Conversation',
    'Grammar',
    'Business English',
    'Interview prep',
    'Pronunciation',
  ],
  general: ['Consultation', 'Review', 'Feedback', 'Strategy'],
};

export const TITLE_PLACEHOLDERS: Record<ServiceType, string> = {
  astrology: 'I will read your natal chart and map the next five years',
  language: 'I will run a conversational session tuned to your level',
  general: 'I will review your work and give a written summary',
};

export const DURATION_CHOICES = [30, 45, 60, 90];

export function getServiceTypeLabel(type: ServiceType): string {
  switch (type) {
    case 'language':
      return 'Language Consultation';
    case 'astrology':
      return 'Astrology Reading';
    case 'general':
      return 'General Consultancy';
    default:
      return type;
  }
}

export function getServiceStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'inactive':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
}
