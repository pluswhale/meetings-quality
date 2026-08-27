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

/**
 * Format a date as the `YYYY-MM-DD` value used by date inputs, based on the
 * calendar date in the user's own timezone. Deriving it from `toISOString()`
 * instead yields the previous day for timezones east of UTC, because a date
 * picked at local midnight is still the day before in UTC.
 */
export const toDateInputValue = (date: string | Date): string => {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return '';

  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
};
