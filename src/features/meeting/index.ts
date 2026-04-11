/**
 * Public API surface for the meeting feature.
 *
 * Import directly from the specific module when you only need one piece:
 *   import { useMeetingSubmissions } from '@/src/features/meeting/hooks';
 *   import type { TaskSubmission } from '@/src/features/meeting/types';
 */

// Domain types
export type {
  MeetingSubmissions,
  MeetingSubmissionsResponse,
  EmotionalSubmission,
  EmotionalEvaluationEntry,
  UnderstandingSubmission,
  ContributionEntry,
  TaskSubmission,
  TaskEvaluationSubmission,
  TaskEvaluationEntry,
  ParticipantCompactRef,
} from './types';

// Hooks
export { useMeetingSubmissions, meetingQueryKeys } from './hooks';
