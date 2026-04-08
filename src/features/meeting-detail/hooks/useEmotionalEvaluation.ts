import { useCallback } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import type { UseEmotionalEvaluationReturn } from '../state/meetingDetail.types';

/**
 * Phase 1 — Emotional Evaluation.
 *
 * Every checkbox toggle fires handleLiveUpdate which calls emitUpdateLiveVote.
 * No submit button, no manual confirmation.
 *
 * buildPayload reads directly from useMeetingStore.getState() to avoid the
 * stale-closure problem: React re-renders are asynchronous, so a useCallback
 * that captures `emotionalEvaluations` from a subscription could still hold the
 * previous snapshot when setTimeout(onLiveUpdate, 0) fires.
 */
export const useEmotionalEvaluation = (
  _meetingId: string,
  socket: UseMeetingSocketReturn,
): UseEmotionalEvaluationReturn => {
  const emotionalEvaluations = useMeetingStore((s) => s.emotionalEvaluations);
  const setEmotionalEntry = useMeetingStore((s) => s.setEmotionalEntry);

  const setEmotionalEvaluations = useCallback(
    (updater: Parameters<UseEmotionalEvaluationReturn['setEmotionalEvaluations']>[0]) => {
      const next =
        typeof updater === 'function' ? updater(emotionalEvaluations) : updater;
      Object.entries(next).forEach(([pid, entry]) => setEmotionalEntry(pid, entry));
    },
    [emotionalEvaluations, setEmotionalEntry],
  );

  // Always reads directly from the store (not from the React subscription
  // snapshot), so it never sees stale data regardless of render timing.
  const buildPayload = useCallback(() => {
    const evals = useMeetingStore.getState().emotionalEvaluations;
    return {
      evaluations: Object.entries(evals).map(([participantId, ev]) => ({
        targetParticipantId: participantId,
        emotionalScale: ev.emotionalScale ?? 0,
        isToxic: ev.isToxic,
      })),
    };
  }, []);

  const handleLiveUpdate = useCallback(() => {
    const payload = buildPayload();
    if (payload.evaluations.length === 0) return;
    socket.emitUpdateLiveVote('emotional_evaluation', payload);
  }, [buildPayload, socket]);

  return {
    emotionalEvaluations,
    setEmotionalEvaluations,
    handleLiveUpdate,
  };
};
