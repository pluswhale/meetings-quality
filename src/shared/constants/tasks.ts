/**
 * Task-related constants and enums
 */

import { TasksControllerFindAllFilter } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

// Re-export generated enums
export { TasksControllerFindAllFilter };

// Filter display names
export const TASK_FILTER_LABELS: Record<TasksControllerFindAllFilter, string> = {
  [TasksControllerFindAllFilter.current]: 'Текущие',
  [TasksControllerFindAllFilter.past]: 'Прошедшие',
} as const;

// Task status labels
export const TASK_STATUS_LABELS = {
  COMPLETED: 'Завершена',
  IN_PROGRESS: 'В процессе',
  OVERDUE: 'Просрочена',
} as const;
