/**
 * Custom hook for fetching voting info (creator only)
 */

import { useMeetingsControllerGetVotingInfo } from '@/src/shared/api/generated/meetings/meetings';
import { POLLING_INTERVALS } from '@/src/shared/constants';

export const useVotingInfo = (meetingId: string, isCreator: boolean, isFinished: boolean) => {
  return useMeetingsControllerGetVotingInfo(meetingId, {
    query: {
      enabled: isCreator && !isFinished && !!meetingId,
      refetchInterval: POLLING_INTERVALS.VOTING_INFO,
    },
  }) as { data: any };
};
