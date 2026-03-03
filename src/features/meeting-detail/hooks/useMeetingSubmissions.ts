import { useQuery } from '@tanstack/react-query';
import { getMeetingSubmissions } from '@/src/features/meeting/api';
import type { MeetingSubmissions } from '@/src/features/meeting/types';
import { POLLING_INTERVALS } from '@/src/shared/constants';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseMeetingSubmissionsReturn } from '../state/meetingDetail.types';

/**
 * Creator-only hook for fetching all phase submissions.
 *
 * Why React Query instead of the previous setInterval + useState pattern:
 *   - Automatic deduplication: multiple components can call this without
 *     triggering redundant requests.
 *   - Cache-based refetching: socket events in useMeetingSocket call
 *     queryClient.invalidateQueries() to refresh without a polling gap.
 *   - Background refetch behaviour is consistent with the rest of the app.
 *   - The `enabled: isCreator` guard means participants never hit this endpoint.
 */
export const useMeetingSubmissions = (
  meetingId: string,
  isCreator: boolean,
): UseMeetingSubmissionsReturn => {
  const { data, isLoading, isRefetching } = useQuery<MeetingSubmissions>({
    queryKey: meetingDetailQueryKeys.submissions(meetingId),
    queryFn: async ({ signal }) => {
      const response = await getMeetingSubmissions(meetingId, signal);

      if (!response?.submissions) {
        // Return empty shells so the UI never crashes on a malformed response.
        return {
          emotional_evaluation: {},
          understanding_contribution: {},
          task_planning: {},
          task_evaluation: {},
        };
      }

      return response.submissions;
    },
    enabled: Boolean(isCreator && meetingId),
    refetchInterval: POLLING_INTERVALS.PHASE_SUBMISSIONS,
    refetchIntervalInBackground: false,
    // Keep previous data visible while refetching to avoid loading flicker.
    placeholderData: (prev) => prev,
  });

  return {
    submissions: data ?? null,
    isLoading,
    isRefreshing: isRefetching,
  };
};
