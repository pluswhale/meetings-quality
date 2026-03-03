/**
 * CreatorSubmissionsPanel
 *
 * Thin adapter that bridges the legacy meeting-detail feature with the new
 * meeting-submissions architecture. It re-exports MeetingSubmissionsView
 * using the domain types from src/features/meeting/types.ts.
 *
 * Migration path: replace usages of this component with
 * <MeetingSubmissionsContainer meetingId={...} onApproveTask={...} />
 * once the parent view is updated to use the new hook directly.
 */

import type {
  EmotionalSubmission,
  MeetingSubmissions,
  TaskSubmission,
  UnderstandingSubmission,
} from '@/src/features/meeting/types';
import { MeetingSubmissionsView } from '@/src/features/meeting/components/MeetingSubmissionsView';

export type { MeetingSubmissions };

interface CreatorSubmissionsPanelProps {
  submissions: MeetingSubmissions | null;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isApprovingTask?: boolean;
  onApproveTask?: (taskId: string, currentApproved: boolean) => void;
}

export const CreatorSubmissionsPanel: React.FC<CreatorSubmissionsPanelProps> = ({
  submissions,
  isLoading = false,
  isRefreshing = false,
  isApprovingTask = false,
  onApproveTask = () => {},
}) => (
  <MeetingSubmissionsView
    submissions={submissions}
    isLoading={isLoading}
    isRefreshing={isRefreshing}
    isApprovingTask={isApprovingTask}
    onApproveTask={onApproveTask}
  />
);

// Named re-exports for any code that destructures individual submission types
// from this module (avoids changing import sites during migration).
export type { EmotionalSubmission, UnderstandingSubmission, TaskSubmission };
