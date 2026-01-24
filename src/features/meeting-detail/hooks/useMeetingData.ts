/**
 * Custom hook for fetching meeting data
 */

import { useMeetingsControllerFindOne } from '@/src/shared/api/generated/meetings/meetings';
import { POLLING_INTERVALS } from '@/src/shared/constants';

export const useMeetingData = (meetingId: string) => {
  return useMeetingsControllerFindOne(meetingId, {
    query: {
      refetchInterval: POLLING_INTERVALS.MEETING_DATA,
      refetchIntervalInBackground: false,
      enabled: !!meetingId,
    },
  });
};
