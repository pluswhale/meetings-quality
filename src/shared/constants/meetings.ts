/**
 * Meeting-related constants and enums
 * Centralized location for all meeting-related constants
 */

import {
  MeetingResponseDtoCurrentPhase as _GeneratedPhase,
  MeetingResponseDtoStatus,
  MeetingsControllerFindAllFilter,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

/**
 * Extended phase enum — includes `retrospective` and `task_evaluation` which
 * were added after the API client was last generated.
 * Import THIS enum everywhere instead of the generated one.
 */
export const MeetingResponseDtoCurrentPhase = {
  ..._GeneratedPhase,
  retrospective: 'retrospective',
  task_evaluation: 'task_evaluation',
} as const;

export type MeetingResponseDtoCurrentPhase =
  (typeof MeetingResponseDtoCurrentPhase)[keyof typeof MeetingResponseDtoCurrentPhase];

export { MeetingResponseDtoStatus, MeetingsControllerFindAllFilter };

// Phase display names
export const PHASE_LABELS: Record<MeetingResponseDtoCurrentPhase, string> = {
  [MeetingResponseDtoCurrentPhase.retrospective]: 'Ретроспектива',
  [MeetingResponseDtoCurrentPhase.emotional_evaluation]: 'Обсуждение',
  [MeetingResponseDtoCurrentPhase.understanding_contribution]: 'Вклад',
  [MeetingResponseDtoCurrentPhase.task_planning]: 'Задачи',
  [MeetingResponseDtoCurrentPhase.task_evaluation]: 'Оценка задач',
  [MeetingResponseDtoCurrentPhase.finished]: 'Завершено',
} as const;

// Phase order for in-meeting navigation (retrospective is handled separately)
export const PHASE_ORDER: MeetingResponseDtoCurrentPhase[] = [
  MeetingResponseDtoCurrentPhase.emotional_evaluation,
  MeetingResponseDtoCurrentPhase.understanding_contribution,
  MeetingResponseDtoCurrentPhase.task_planning,
  MeetingResponseDtoCurrentPhase.finished,
] as const;

// Status display names
export const STATUS_LABELS: Record<MeetingResponseDtoStatus, string> = {
  [MeetingResponseDtoStatus.upcoming]: 'Предстоящая',
  [MeetingResponseDtoStatus.active]: 'Активная',
  [MeetingResponseDtoStatus.finished]: 'Завершенная',
} as const;

// Filter display names
export const FILTER_LABELS: Record<MeetingsControllerFindAllFilter, string> = {
  [MeetingsControllerFindAllFilter.current]: 'Текущие',
  [MeetingsControllerFindAllFilter.past]: 'Прошедшие',
  [MeetingsControllerFindAllFilter.upcoming]: 'Предстоящие',
} as const;

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  MEETING_DATA: 2000,
  VOTING_INFO: 2000,
  PHASE_SUBMISSIONS: 2000,
  STATISTICS: 2000,
} as const;

// Validation constants
export const VALIDATION = {
  MIN_EMOTIONAL_SCALE: -100,
  MAX_EMOTIONAL_SCALE: 100,
  MIN_CONTRIBUTION: 0,
  MAX_CONTRIBUTION: 100,
  REQUIRED_CONTRIBUTION_TOTAL: 100,
  CONTRIBUTION_TOLERANCE: 0.1,
} as const;
