import { useCallback, useEffect, useMemo, type SetStateAction } from 'react';
import { useTasksControllerFindByMeeting } from '@/src/shared/api/generated/tasks/tasks';
import { useMeetingStore } from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import type { EvaluableTask, UseTaskEvaluationReturn } from '../state/meetingDetail.types';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { meetingDetailQueryKeys } from './queryKeys';

/**
 * Phase 4 — Task Evaluation.
 *
 * Entries are keyed by the persisted task `_id`. Own tasks are excluded.
 */
export const useTaskEvaluation = (
  meetingId: string,
  socket: UseMeetingSocketReturn,
): UseTaskEvaluationReturn => {
  const taskEvaluations = useMeetingStore((s) => s.taskEvaluations);
  const setTaskEvaluationEntry = useMeetingStore((s) => s.setTaskEvaluation);
  const currentUserId = useAuthStore((s) => s.currentUser?._id);
  const phase = useMeetingStore((s) => s.phase);
  const ownVote = useMeetingStore((s) =>
    currentUserId ? s.votesByPhase.task_evaluation?.[currentUserId] : undefined,
  );

  const { data: meetingTasks = [] } = useTasksControllerFindByMeeting(meetingId, {
    query: {
      queryKey: meetingDetailQueryKeys.meetingTasks(meetingId),
      enabled: Boolean(meetingId),
      staleTime: 5_000,
    },
  });

  const evaluableTasks: EvaluableTask[] = useMemo(
    () =>
      meetingTasks
        .filter((t) => t.authorId._id !== currentUserId)
        .map((t) => ({
          _id: t._id,
          description: t.description,
          authorId: t.authorId._id,
          authorName: t.authorId.fullName ?? 'Участник',
        })),
    [meetingTasks, currentUserId],
  );

  useEffect(() => {
    if (!currentUserId || !ownVote?.payload) return;
    const current = useMeetingStore.getState().taskEvaluations;
    if (Object.keys(current).length > 0) return;
    const list = ownVote.payload.evaluations as
      | Array<{ taskAuthorId?: string; taskId?: string; importanceScore: number }>
      | undefined;
    list?.forEach((e) => {
      const key = e.taskId ?? e.taskAuthorId;
      if (key) setTaskEvaluationEntry(key, e.importanceScore);
    });
  }, [currentUserId, ownVote, phase, setTaskEvaluationEntry]);

  const setTaskEvaluations = useCallback(
    (updater: SetStateAction<Record<string, number>>) => {
      const next = typeof updater === 'function' ? updater(taskEvaluations) : updater;
      Object.entries(next).forEach(([id, score]) => setTaskEvaluationEntry(id, score));
    },
    [taskEvaluations, setTaskEvaluationEntry],
  );

  const emitEvaluations = useCallback(
    (updated: Record<string, number>) => {
      const byId = new Map(evaluableTasks.map((t) => [t._id, t]));
      socket.emitUpdateLiveVote('task_evaluation', {
        evaluations: Object.entries(updated).map(([taskId, importanceScore]) => {
          const task = byId.get(taskId);
          return {
            taskId,
            ...(task ? { taskAuthorId: task.authorId } : {}),
            importanceScore,
          };
        }),
      });
    },
    [evaluableTasks, socket],
  );

  const handleLiveUpdate = useCallback(
    (taskId: string, score: number) => {
      setTaskEvaluationEntry(taskId, score);
      const updated = { ...useMeetingStore.getState().taskEvaluations, [taskId]: score };
      emitEvaluations(updated);
    },
    [setTaskEvaluationEntry, emitEvaluations],
  );

  return {
    taskEvaluations,
    setTaskEvaluations,
    evaluableTasks,
    handleLiveUpdate,
  };
};
