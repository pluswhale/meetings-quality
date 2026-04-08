import { useQuery } from '@tanstack/react-query';
import { getMeetingSubmissions } from '@/src/features/meeting/api';
import type { MeetingSubmissions } from '@/src/features/meeting/types';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseMeetingSubmissionsReturn } from '../state/meetingDetail.types';

/**
 * Creator-only hook that fetches the historical all-submissions snapshot once.
 *
 * There is NO refetchInterval here. The data refreshes only when
 * useMeetingSocket receives room:phase_sync and calls:
 *   queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.submissions(meetingId) })
 *
 * Live per-submission notifications come through the Zustand store via the
 * admin:submission_received WebSocket event — see useMeetingStore.adminSubmissions.
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
    // No refetchInterval — refreshed by query invalidation on phase advance only
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return {
    submissions: data ?? null,
    isLoading,
    isRefreshing: isRefetching,
  };
};
