import { useCallback, useEffect } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import type { UseEmotionalEvaluationReturn } from '../state/meetingDetail.types';
import { useAuthStore } from '@/src/shared/store/auth.store';

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
  const currentUserId = useAuthStore((s) => s.currentUser?._id);
  const phase = useMeetingStore((s) => s.phase);
  const ownVote = useMeetingStore(
    (s) => (currentUserId ? s.votesByPhase.emotional_evaluation?.[currentUserId] : undefined),
  );

  useEffect(() => {
    if (!currentUserId || !ownVote?.payload) return;
    const evals = ownVote.payload.evaluations as
      | Array<{ targetParticipantId: string; emotionalScale: number; isToxic: boolean }>
      | undefined;
    if (!evals?.length) return;
    const current = useMeetingStore.getState().emotionalEvaluations;
    if (Object.keys(current).length > 0) return;
    evals.forEach((e) =>
      setEmotionalEntry(e.targetParticipantId, {
        emotionalScale: e.emotionalScale ?? 0,
        isToxic: e.isToxic ?? false,
      }),
    );
  }, [currentUserId, ownVote, phase, setEmotionalEntry]);

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
