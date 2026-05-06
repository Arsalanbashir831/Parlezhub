import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  // Use distance to now for a more "human" feel (e.g., "2 hours ago")
  return formatDistanceToNow(date, { addSuffix: true });
};

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, h:mm a');
};

export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  
  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  }
  
  return format(date, 'MMM d, yyyy');
};

/**
 * Formats seconds into a timer string (MM:SS)
 */
export const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculates percentage for progress bars
 */
export const getPercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return (current / total) * 100;
};
