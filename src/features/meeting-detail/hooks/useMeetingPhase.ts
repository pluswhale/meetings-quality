import { useState } from 'react';
import toast from 'react-hot-toast';
import type { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import { PHASE_LABELS, PHASE_ORDER } from '@/src/shared/constants';
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
 *
 *
 */

const NEXT_PHASE: Partial<Record<MeetingPhase, MeetingPhase>> = {
  retrospective: 'emotional_evaluation',
  emotional_evaluation: 'understanding_contribution',
  understanding_contribution: 'task_planning',
  task_planning: 'finished',
};

export type UseMeetingPhaseParams = {
  meetingId: string;
  currentPhase: MeetingResponseDtoCurrentPhase | undefined;
  projectId: string | null;
  isCreator: boolean;
  socket: UseMeetingSocketReturn;
};

export const useMeetingPhase = (
  useMeetingPhaseParams: UseMeetingPhaseParams,
): UseMeetingPhaseReturn => {
  const { currentPhase, isCreator, socket } = useMeetingPhaseParams;

  // Participants may "view" past phases without changing the live phase.
  const [viewedPhase, setViewedPhase] = useState<MeetingResponseDtoCurrentPhase | null>(null);

  // Live phase comes from Zustand (updated by room:state_sync / room:phase_sync).
  // Starts as null until the first WebSocket sync arrives — currentPhase (REST) fills the gap.
  const livePhase = useMeetingStore((s) => s.phase) as MeetingResponseDtoCurrentPhase | null;
  const activePhase = viewedPhase ?? livePhase ?? currentPhase;

  const nextPhase = NEXT_PHASE[activePhase as MeetingPhase] ?? null;

  const handleNextPhase = () => {
    if (nextPhase === 'finished') socket.emitFinishMeeting();
    else if (nextPhase) socket.emitAdvancePhase(nextPhase);
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

    if (targetIndex === currentIndex) {
      // Clicking the live phase chip exits view mode (returns to the live phase).
      if (viewedPhase) handleReturnToCurrentPhase();
      return;
    }

    if (targetIndex > currentIndex) {
      // Ahead of the live phase — nothing to view
      return;
    }

    setViewedPhase(targetPhase);
    toast.success(`Просмотр: ${PHASE_LABELS[targetPhase]}`);
  };

  // Step view mode one phase back from the currently displayed phase.
  const handleViewPrevPhase = () => {
    const activeIndex = PHASE_ORDER.indexOf(activePhase as MeetingPhase);
    if (activeIndex <= 0) return;
    setViewedPhase(PHASE_ORDER[activeIndex - 1]);
  };

  // Step view mode one phase forward; reaching the live phase exits view mode.
  const handleViewNextPhase = () => {
    const source = livePhase ?? currentPhase;
    if (!viewedPhase || !source) return;

    const viewedIndex = PHASE_ORDER.indexOf(viewedPhase);
    const liveIndex = PHASE_ORDER.indexOf(source);

    if (viewedIndex + 1 >= liveIndex) setViewedPhase(null);
    else setViewedPhase(PHASE_ORDER[viewedIndex + 1]);
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
    handleViewPrevPhase,
    handleViewNextPhase,
  };
};
