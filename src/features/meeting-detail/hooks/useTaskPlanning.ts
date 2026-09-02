import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTasksControllerFindAll } from '@/src/shared/api/generated/tasks/tasks';
import { toDateInputValue } from '@/src/shared/lib';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import type { PlanningTaskDraft, UseTaskPlanningReturn } from '../state/meetingDetail.types';
import { useMeetingStore } from '../store/useMeetingStore';

const mintTaskKey = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const emptyDraft = (): PlanningTaskDraft => ({
  taskKey: mintTaskKey(),
  description: '',
  estimateHours: '',
  deadline: '',
  expectedContribution: 50,
});

const isDraftComplete = (task: PlanningTaskDraft): boolean =>
  task.description.trim().length > 0 &&
  task.deadline !== '' &&
  task.estimateHours !== '' &&
  Number(task.estimateHours) > 0;

/**
 * Phase 3 — Task Planning.
 *
 * One participant may hold several tasks. Each draft has a client-minted
 * taskKey. Only complete drafts are emitted; incomplete ones stay local.
 */
export const useTaskPlanning = (
  meetingId: string,
  currentUserId: string | undefined,
  socket: UseMeetingSocketReturn,
): UseTaskPlanningReturn => {
  const { data: userTasks = [] } = useTasksControllerFindAll(undefined, {
    query: {
      queryKey: meetingDetailQueryKeys.userTasks(),
      enabled: Boolean(currentUserId),
      staleTime: 10_000,
    },
  });

  const meetingTasks = useMemo(
    () => userTasks.filter((t) => t.meetingId._id === meetingId),
    [userTasks, meetingId],
  );

  const myTaskApprovedFromWs = useMeetingStore((s) => s.myTaskApproved);
  const myTaskApprovals = useMeetingStore((s) => s.myTaskApprovals);
  const phase = useMeetingStore((s) => s.phase);
  const ownVote = useMeetingStore((s) =>
    currentUserId ? s.votesByPhase.task_planning?.[currentUserId] : undefined,
  );

  const [tasks, setTasks] = useState<PlanningTaskDraft[]>(() => [emptyDraft()]);
  const [taskEmotionalScale, setTaskEmotionalScale] = useState(50);

  useEffect(() => {
    const hasLocalContent = tasks.some(
      (t) => t.description.trim() || t.deadline || t.estimateHours,
    );
    if (hasLocalContent) return;

    const payload = ownVote?.payload;
    const liveTasks = payload?.tasks as
      | Array<{
          taskKey?: string;
          description?: string;
          deadline?: string;
          estimateHours?: number;
          expectedContributionPercentage?: number;
        }>
      | undefined;

    if (Array.isArray(liveTasks) && liveTasks.length > 0) {
      setTasks(
        liveTasks.map((t) => ({
          taskKey: t.taskKey || mintTaskKey(),
          description: t.description ?? '',
          estimateHours: t.estimateHours != null ? String(t.estimateHours) : '',
          deadline: t.deadline ? toDateInputValue(t.deadline) : '',
          expectedContribution: t.expectedContributionPercentage ?? 50,
        })),
      );
      return;
    }

    if (typeof payload?.taskDescription === 'string' && payload.taskDescription) {
      setTasks([
        {
          taskKey: mintTaskKey(),
          description: payload.taskDescription as string,
          estimateHours:
            payload.estimateHours != null ? String(payload.estimateHours) : '',
          deadline: payload.deadline ? toDateInputValue(payload.deadline as string) : '',
          expectedContribution: (payload.expectedContributionPercentage as number) ?? 50,
        },
      ]);
      return;
    }

    if (meetingTasks.length > 0) {
      setTasks(
        meetingTasks.map((t) => ({
          taskKey: t.taskKey || t._id,
          description: t.description ?? '',
          estimateHours: t.estimateHours != null ? String(t.estimateHours) : '',
          deadline: t.deadline ? toDateInputValue(t.deadline) : '',
          expectedContribution: t.contributionImportance ?? 50,
        })),
      );
    }
    // Rehydrate when the phase identity or own vote first arrives, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, ownVote, phase, meetingTasks]);

  const isTaskApproved = useCallback(
    (taskKey: string) => {
      if (myTaskApprovals[taskKey]) return true;
      const mongo = meetingTasks.find((t) => t.taskKey === taskKey || t._id === taskKey);
      if (mongo?.approved) return true;
      if (tasks.length === 1 && !tasks[0]?.taskKey) return myTaskApprovedFromWs;
      return false;
    },
    [myTaskApprovals, meetingTasks, myTaskApprovedFromWs, tasks],
  );

  const emitCompleteTasks = useCallback(
    (list: PlanningTaskDraft[]) => {
      const complete = list.filter(isDraftComplete).map((t) => ({
        taskKey: t.taskKey,
        description: t.description.trim(),
        deadline: t.deadline ? new Date(t.deadline).toISOString() : '',
        estimateHours: Number(t.estimateHours),
        expectedContributionPercentage: t.expectedContribution,
      }));
      socket.emitUpdateLiveVote('task_planning', { tasks: complete });
    },
    [socket],
  );

  const handleLiveUpdate = useCallback(() => {
    emitCompleteTasks(tasks);
  }, [emitCompleteTasks, tasks]);

  const addTask = useCallback(() => {
    setTasks((prev) => [...prev, emptyDraft()]);
  }, []);

  const removeTask = useCallback(
    (taskKey: string) => {
      if (isTaskApproved(taskKey)) return;
      setTasks((prev) => {
        const next = prev.filter((t) => t.taskKey !== taskKey);
        const list = next.length > 0 ? next : [emptyDraft()];
        emitCompleteTasks(list);
        return list;
      });
    },
    [emitCompleteTasks, isTaskApproved],
  );

  const updateTask = useCallback((taskKey: string, patch: Partial<PlanningTaskDraft>) => {
    setTasks((prev) => prev.map((t) => (t.taskKey === taskKey ? { ...t, ...patch } : t)));
  }, []);

  const onChangeEstimateHours = useCallback(
    (taskKey: string, v: string) => {
      if (v === '' || /^\d*\.?\d*$/.test(v)) {
        updateTask(taskKey, { estimateHours: v });
      }
    },
    [updateTask],
  );

  const isTaskPlanningValid = tasks.some(isDraftComplete);

  return {
    tasks,
    addTask,
    removeTask,
    updateTask,
    onChangeEstimateHours,
    isTaskApproved,
    isDraftComplete,
    taskEmotionalScale,
    setTaskEmotionalScale,
    isTaskPlanningValid,
    handleLiveUpdate,
  };
};
