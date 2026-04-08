import {
  useMeetingsControllerFindOne,
  useMeetingsControllerGetStatistics,
} from '@/src/shared/api/generated/meetings/meetings';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import type { UseMeetingDataReturn } from '../state/meetingDetail.types';

/**
 * Fetches the core meeting document once on mount.
 *
 * There is NO refetchInterval here. Phase changes are pushed via the
 * room:phase_sync WebSocket event which calls:
 *   queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) })
 *
 * This keeps the meeting document in sync without any polling overhead.
 * Statistics are only fetched after the meeting is finished.
 */
export const useMeetingData = (meetingId: string): UseMeetingDataReturn => {
  const { data: meeting, isLoading } = useMeetingsControllerFindOne(meetingId, {
    query: {
      enabled: Boolean(meetingId),
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      // No refetchInterval — invalidated by room:phase_sync WS event
    },
  });

  const isFinished = meeting?.currentPhase === MeetingResponseDtoCurrentPhase.finished;

  const { data: statistics } = useMeetingsControllerGetStatistics(meetingId, {
    query: {
      enabled: isFinished,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  });

  return { meeting, statistics, isLoading, isFinished };
};
