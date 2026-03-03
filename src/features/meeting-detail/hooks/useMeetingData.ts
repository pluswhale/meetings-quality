import {
  useMeetingsControllerFindOne,
  useMeetingsControllerGetStatistics,
} from '@/src/shared/api/generated/meetings/meetings';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { POLLING_INTERVALS } from '@/src/shared/constants';
import type { UseMeetingDataReturn } from '../state/meetingDetail.types';

/**
 * Fetches the core meeting document and, once finished, its statistics.
 *
 * Polling at MEETING_DATA interval keeps the phase badge and participant list
 * in sync without a WebSocket. Statistics are only fetched in the finished phase
 * to avoid unnecessary load.
 */
export const useMeetingData = (meetingId: string): UseMeetingDataReturn => {
  const { data: meeting, isLoading } = useMeetingsControllerFindOne(meetingId, {
    query: {
      enabled: Boolean(meetingId),
      refetchInterval: POLLING_INTERVALS.MEETING_DATA,
      refetchIntervalInBackground: false,
    },
  });

  const isFinished = meeting?.currentPhase === MeetingResponseDtoCurrentPhase.finished;

  const { data: statistics } = useMeetingsControllerGetStatistics(meetingId, {
    query: {
      enabled: isFinished,
      refetchInterval: isFinished ? POLLING_INTERVALS.STATISTICS : false,
    },
  });

  return { meeting, statistics, isLoading, isFinished };
};
