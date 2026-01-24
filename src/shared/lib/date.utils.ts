/**
 * Date utility functions
 */

/**
 * Format date to Russian locale
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  
  return new Date(date).toLocaleDateString('ru-RU', options || defaultOptions);
};

/**
 * Format time to Russian locale
 */
export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if date is overdue
 */
export const isOverdue = (deadline: string | Date): boolean => {
  return new Date(deadline) < new Date();
};

/**
 * Convert date to ISO string
 */
export const toISOString = (date: string | Date): string => {
  return new Date(date).toISOString();
};
