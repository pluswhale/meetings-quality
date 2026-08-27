import {
  useMeetingsControllerFindOne,
  useMeetingsControllerGetStatistics,
} from '@/src/shared/api/generated/meetings/meetings';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import type { UseMeetingDataReturn } from '../state/meetingDetail.types';

/**
 * Fetches the core meeting document.
 *
 * There is NO refetchInterval here. The WebSocket is the update channel:
 * room:phase_changed and the recovery resync in useMeetingSocket both call
 *   queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) })
 *
 * staleTime is finite so that the automatic refetch triggers still apply —
 * notably refetchOnReconnect, which never fires while data is treated as
 * permanently fresh. Explicit invalidations refetch regardless of staleTime.
 *
 * Statistics are only fetched after the meeting is finished.
 */
const MEETING_STALE_TIME_MS = 30_000;

export const useMeetingData = (meetingId: string): UseMeetingDataReturn => {
  const { data: meeting, isLoading } = useMeetingsControllerFindOne(meetingId, {
    query: {
      enabled: Boolean(meetingId),
      staleTime: MEETING_STALE_TIME_MS,
      refetchOnWindowFocus: false,
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
