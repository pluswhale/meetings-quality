import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import { PHASE_LABELS, PHASE_ORDER } from '@/src/shared/constants';
import { getNextPhase } from '../lib';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseMeetingPhaseReturn } from '../state/meetingDetail.types';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import type { MeetingPhase } from '../store/useMeetingStore';
import { useMeetingStore } from '../store/useMeetingStore';

/**
 * Manages the meeting phase lifecycle.
 *
 * Creator: phase changes go through Socket.IO (admin:advance_phase / admin:finish_meeting).
 * Participant: sets viewedPhase client-side only — no network request.
 *
 * The Zustand store is the source of truth for `phase` during a live meeting.
 * `currentPhase` (from REST) is only used for initial render and statistics.
 */
export const useMeetingPhase = (
  meetingId: string,
  currentPhase: MeetingResponseDtoCurrentPhase | undefined,
  isCreator: boolean,
  socket: UseMeetingSocketReturn,
): UseMeetingPhaseReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Participants may "view" past phases without changing the live phase.
  const [viewedPhase, setViewedPhase] = useState<MeetingResponseDtoCurrentPhase | null>(null);

  // Live phase comes from Zustand (updated by room:state_sync / room:phase_sync).
  // Starts as null until the first WebSocket sync arrives — currentPhase (REST) fills the gap.
  const livePhase = useMeetingStore((s) => s.phase) as MeetingResponseDtoCurrentPhase | null;
  const activePhase = viewedPhase ?? livePhase ?? currentPhase;

  const handleNextPhase = () => {
    if (!isCreator) return;
    const source = livePhase ?? currentPhase;
    if (!source) return;

    const next = getNextPhase(source);
    if (!next) return;

    if (next === 'finished') {
      socket.emitFinishMeeting();
      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
      navigate('/meeting/create');
      return;
    }

    socket.emitAdvancePhase(next as MeetingPhase);
    queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
  };

  const handleChangeToPhase = (targetPhase: MeetingResponseDtoCurrentPhase) => {
    // Phase advancement (for creator) is handled exclusively by the
    // CreatorAdminPanel advance button via emitAdvancePhase.
    // Clicking a phase chip in the header only enters "view mode" for all users —
    // it must never trigger a real phase transition.
    const source = livePhase ?? currentPhase;
    if (!source) return;

    const currentIndex = PHASE_ORDER.indexOf(source);
    const targetIndex = PHASE_ORDER.indexOf(targetPhase);

    if (targetIndex >= currentIndex) {
      // Already at or ahead of target — nothing to view
      return;
    }

    setViewedPhase(targetPhase);
    toast.success(`Просмотр: ${PHASE_LABELS[targetPhase]}`);
  };

  const handleReturnToCurrentPhase = () => {
    setViewedPhase(null);
    toast.success('Returned to current phase');
  };

  return {
    viewedPhase,
    activePhase,
    // The gateway is fire-and-forget; optimistic state is managed in Zustand.
    isChangingPhase: false,
    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
  };
};
