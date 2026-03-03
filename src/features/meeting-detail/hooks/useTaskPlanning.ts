import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  useMeetingsControllerSubmitTaskPlanning,
} from '@/src/shared/api/generated/meetings/meetings';
import { useTasksControllerCreate, useTasksControllerFindAll } from '@/src/shared/api/generated/tasks/tasks';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseTaskPlanningReturn } from '../state/meetingDetail.types';

/**
 * Phase 4 — Task Planning.
 *
 * Owns:
 *   - Form fields: taskDescription, commonQuestion, estimateHours (string draft),
 *     deadline, expectedContribution, taskEmotionalScale.
 *   - `estimateHours` is maintained as a string internally so the input can hold
 *     intermediate states (e.g. ""). The value is parsed to a number only at submit.
 *   - Queries the current user's task list to pre-populate the form and derive
 *     `isMyTaskApproved` without relying on the removed `meeting.taskPlannings`.
 *   - Submit triggers both the meeting's task-planning endpoint AND the Tasks
 *     collection create endpoint (upsert pattern on the backend).
 */
export const useTaskPlanning = (
  meetingId: string,
  currentUserId: string | undefined,
): UseTaskPlanningReturn => {
  const queryClient = useQueryClient();

  // ─── Existing task query ───────────────────────────────────────────────────
  // The tasks endpoint returns all tasks for the current user. We filter to find
  // the task for this meeting. This replaces the removed meeting.taskPlannings.
  const { data: userTasks = [] } = useTasksControllerFindAll(undefined, {
    query: {
      queryKey: meetingDetailQueryKeys.userTasks(),
      enabled: Boolean(currentUserId),
      staleTime: 10_000,
    },
  });

  const myTask = useMemo(
    () => userTasks.find((t) => t.meetingId._id === meetingId),
    [userTasks, meetingId],
  );

  const isMyTaskApproved = myTask?.approved ?? false;

  // ─── Form state ────────────────────────────────────────────────────────────
  const [taskDescription, setTaskDescription] = useState('');
  const [commonQuestion, setCommonQuestion] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [deadline, setDeadline] = useState('');
  const [expectedContribution, setExpectedContribution] = useState(50);
  const [taskEmotionalScale, setTaskEmotionalScale] = useState(50);

  // Populate form from existing task (inline sync — no useEffect per rule 5.1).
  const prevTaskRef = { current: myTask };
  if (myTask && prevTaskRef.current !== myTask) {
    prevTaskRef.current = myTask;
    if (myTask.description) setTaskDescription(myTask.description);
    if (myTask.commonQuestion) setCommonQuestion(myTask.commonQuestion);
    if (myTask.estimateHours) setEstimateHours(String(myTask.estimateHours));
    if (myTask.deadline) setDeadline(new Date(myTask.deadline).toISOString().split('T')[0]);
    if (myTask.contributionImportance !== undefined) setExpectedContribution(myTask.contributionImportance);
  }

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: submitTaskPlanning, isPending: isSubmittingPlanning } =
    useMeetingsControllerSubmitTaskPlanning();

  const { mutate: createTask, isPending: isCreatingTask } = useTasksControllerCreate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.userTasks() });
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meetingTasks(meetingId) });
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
        toast.success('Задача создана и добавлена в ваш список!');
      },
      onError: (err) => {
        toast.error(`План сохранен, но задача не создана: ${extractMessage(err)}`);
      },
    },
  });

  const handleSubmit = useCallback(() => {
    if (!taskDescription || !deadline) {
      toast.error('Заполните описание задачи и дедлайн');
      return;
    }

    const deadlineISO = new Date(deadline).toISOString();
    const estimateHoursNum = estimateHours === '' ? 0 : Number(estimateHours);

    submitTaskPlanning(
      {
        id: meetingId,
        data: {
          taskDescription,
          commonQuestion,
          deadline: deadlineISO,
          expectedContributionPercentage: expectedContribution,
        },
      },
      {
        onSuccess: () => {
          createTask({
            data: {
              description: taskDescription,
              commonQuestion,
              meetingId,
              deadline: deadlineISO,
              estimateHours: estimateHoursNum,
              contributionImportance: expectedContribution,
            },
          });
        },
        onError: (err) => {
          toast.error(`Ошибка: ${extractMessage(err)}`);
        },
      },
    );
  }, [
    meetingId, taskDescription, commonQuestion, estimateHours,
    deadline, expectedContribution, submitTaskPlanning, createTask,
  ]);

  // ─── estimateHours — string draft (no NaN ever) ────────────────────────────
  const onChangeEstimateHours = useCallback((v: string) => {
    if (v === '' || /^\d*\.?\d*$/.test(v)) {
      setEstimateHours(v);
    }
  }, []);

  const handleAutoSaveTaskEmotionalScale = useCallback(() => {
    // Intentionally empty — emotional scale is local-only for now.
    // Extend here when the backend gains this endpoint.
  }, []);

  return {
    taskDescription,
    setTaskDescription,
    commonQuestion,
    setCommonQuestion,
    estimateHours,
    onChangeEstimateHours,
    deadline,
    setDeadline,
    expectedContribution,
    setExpectedContribution,
    taskEmotionalScale,
    setTaskEmotionalScale,
    handleAutoSaveTaskEmotionalScale,
    isMyTaskApproved,
    isSubmitting: isSubmittingPlanning || isCreatingTask,
    handleSubmit,
  };
};

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? 'Ошибка';
  }
  return 'Ошибка';
}
