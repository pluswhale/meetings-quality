/**
 * MeetingSubmissionsContainer — data container for the submissions panel.
 *
 * Responsibilities:
 *   - Calls useMeetingSubmissions to own the data-fetching lifecycle.
 *   - Maps loading / error states to appropriate UI signals.
 *   - Passes clean domain data downward — the view never sees React Query state.
 *
 * The container does NOT transform data. It is the glue between the hook
 * and the presentational component. Business logic (approve/reject) is
 * delegated via the `onApproveTask` prop from the parent feature.
 */

import { memo } from 'react';
import { useMeetingSubmissions } from '../hooks';
import { MeetingSubmissionsView } from '../components/MeetingSubmissionsView';

export interface MeetingSubmissionsContainerProps {
  meetingId: string;
  /** Called when the creator toggles task approval. The parent owns the mutation. */
  onApproveTask: (taskId: string, currentApproved: boolean) => void;
  isApprovingTask?: boolean;
}

export const MeetingSubmissionsContainer = memo<MeetingSubmissionsContainerProps>(
  function MeetingSubmissionsContainer({ meetingId, onApproveTask, isApprovingTask = false }) {
    const { data, isLoading, isRefetching, isError, error } = useMeetingSubmissions(meetingId);

    if (isError) {
      return <SubmissionsErrorState error={error} />;
    }

    return (
      <MeetingSubmissionsView
        submissions={data?.submissions ?? null}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onApproveTask={onApproveTask}
        isApprovingTask={isApprovingTask}
      />
    );
  },
);

MeetingSubmissionsContainer.displayName = 'MeetingSubmissionsContainer';

// ─── Error state ──────────────────────────────────────────────────────────────

const SubmissionsErrorState = ({ error }: { error: unknown }) => {
  const message =
    error instanceof Error ? error.message : 'Не удалось загрузить данные голосования';

  return (
    <div className="bg-white rounded-[20px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-red-100 overflow-hidden mb-8 md:mb-12">
      <div className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5C2.57 18.333 3.532 20 5.07 20z"
            />
          </svg>
        </div>
        <p className="font-bold text-slate-700 text-base">Ошибка загрузки</p>
        <p className="text-slate-400 text-sm mt-1">{message}</p>
      </div>
    </div>
  );
};
