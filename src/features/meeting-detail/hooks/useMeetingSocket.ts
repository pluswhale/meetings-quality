import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { meetingDetailQueryKeys } from './queryKeys';
import { TASK_UPDATE_TYPES, VOTING_UPDATE_TYPES } from '../state/meetingDetail.types';
import type { SocketUpdateType, UseMeetingSocketReturn } from '../state/meetingDetail.types';

interface UseMeetingSocketOptions {
  isCreator: boolean;
  /**
   * Called when a voting update arrives and the current user is the creator.
   * Intended for toast notifications — kept outside this hook per SRP.
   */
  onNotification?: (type: SocketUpdateType) => void;
}

/**
 * Subscribes to the custom window events emitted by the underlying useSocket hook
 * and converts them into React Query cache invalidations.
 *
 * This is the ONLY place in the feature that listens to socket window events.
 * The pattern (window custom events → query invalidation) decouples the
 * Socket.IO transport layer from the React Query data layer.
 *
 * Toast logic is intentionally absent — notifications are delegated via
 * the `onNotification` callback so this hook stays infrastructure-only.
 */
export const useMeetingSocket = (
  meetingId: string,
  options: UseMeetingSocketOptions,
): UseMeetingSocketReturn => {
  const queryClient = useQueryClient();
  const { isCreator } = options;

  // Store the callback in a ref so the effect closure never becomes stale.
  const onNotificationRef = useRef(options.onNotification);
  onNotificationRef.current = options.onNotification;

  useEffect(() => {
    const invalidateMeeting = () => {
      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
    };

    const invalidateVoters = () => {
      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.pendingVoters(meetingId) });
    };

    const invalidateSubmissions = () => {
      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.submissions(meetingId) });
    };

    const handleMeetingUpdated = (event: CustomEvent<{ type?: string }>) => {
      const type = event.detail?.type as SocketUpdateType | undefined;

      if (type && TASK_UPDATE_TYPES.has(type)) {
        invalidateMeeting();
        queryClient.invalidateQueries({
          queryKey: meetingDetailQueryKeys.meetingTasks(meetingId),
        });
        if (isCreator) invalidateSubmissions();
      }

      if (type && VOTING_UPDATE_TYPES.has(type)) {
        invalidateVoters();
        if (isCreator) {
          invalidateSubmissions();
          onNotificationRef.current?.(type);
        }
      }

      // Always keep the meeting document fresh.
      invalidateMeeting();
    };

    const handleParticipantsUpdated = () => {
      invalidateVoters();
    };

    const handlePhaseChanged = () => {
      invalidateVoters();
      invalidateMeeting();
      if (isCreator) invalidateSubmissions();
    };

    window.addEventListener('meetingUpdated', handleMeetingUpdated as EventListener);
    window.addEventListener('participants_updated', handleParticipantsUpdated);
    window.addEventListener('phaseChanged', handlePhaseChanged as EventListener);

    return () => {
      window.removeEventListener('meetingUpdated', handleMeetingUpdated as EventListener);
      window.removeEventListener('participants_updated', handleParticipantsUpdated);
      window.removeEventListener('phaseChanged', handlePhaseChanged as EventListener);
    };
  }, [meetingId, queryClient, isCreator]);

  // No return value — this hook exists purely for its side effects.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {} as UseMeetingSocketReturn;
};
