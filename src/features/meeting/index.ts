/**
 * Public API surface for the meeting feature.
 *
 * Import directly from the specific module when you only need one piece,
 * to avoid pulling in the entire feature bundle:
 *
 *   import { useMeetingSubmissions } from '@/src/features/meeting/hooks';
 *   import type { TaskSubmission } from '@/src/features/meeting/types';
 */

// Domain types — the only types consumers should reference for submission data.
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

// Container (smart, owns data fetching)
export {
  MeetingSubmissionsContainer,
  type MeetingSubmissionsContainerProps,
} from './containers/MeetingSubmissionsContainer';

// Presentational components (dumb, pure)
export {
  MeetingSubmissionsView,
  type MeetingSubmissionsViewProps,
} from './components/MeetingSubmissionsView';

export { NumberInput, type NumberInputProps } from './components/NumberInput';
