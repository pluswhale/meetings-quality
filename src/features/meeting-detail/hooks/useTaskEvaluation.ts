import { useCallback } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import type { UseTaskEvaluationReturn } from '../state/meetingDetail.types';

/**
 * Phase 4 — Task Evaluation.
 *
 * Every slider release fires handleLiveUpdate → emitUpdateLiveVote.
 * No submit button.
 */
export const useTaskEvaluation = (
  _meetingId: string,
  socket: UseMeetingSocketReturn,
): UseTaskEvaluationReturn => {
  const taskEvaluations = useMeetingStore((s) => s.taskEvaluations);
  const setTaskEvaluationEntry = useMeetingStore((s) => s.setTaskEvaluation);

  const setTaskEvaluations = useCallback(
    (updater: React.SetStateAction<Record<string, number>>) => {
      const next = typeof updater === 'function' ? updater(taskEvaluations) : updater;
      Object.entries(next).forEach(([authorId, score]) =>
        setTaskEvaluationEntry(authorId, score),
      );
    },
    [taskEvaluations, setTaskEvaluationEntry],
  );

  const handleLiveUpdate = useCallback(
    (authorId: string, score: number) => {
      setTaskEvaluationEntry(authorId, score);
      const updated = { ...taskEvaluations, [authorId]: score };
      socket.emitUpdateLiveVote('task_evaluation', {
        evaluations: Object.entries(updated).map(([taskAuthorId, importanceScore]) => ({
          taskAuthorId,
          importanceScore,
        })),
      });
    },
    [taskEvaluations, setTaskEvaluationEntry, socket],
  );

  return {
    taskEvaluations,
    setTaskEvaluations,
    handleLiveUpdate,
  };
};
