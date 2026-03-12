import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/src/shared/store/auth.store';
import {
  useTasksControllerFindOne,
  useTasksControllerUpdate,
  getTasksControllerFindOneQueryKey,
  getTasksControllerFindAllQueryKey,
} from '@/src/shared/api/generated/tasks/tasks';
import { TaskDetailViewModel } from './types';
import { toISOString } from '@/src/shared/lib';

export const useTaskDetailViewModel = (taskId: string): TaskDetailViewModel => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();

  const { data: task, isLoading } = useTasksControllerFindOne(taskId, {
    query: { enabled: Boolean(taskId) },
  });

  const { mutate: updateTask, isPending: isUpdating } = useTasksControllerUpdate();

  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setDescription(task.description);
      setDeadline(new Date(task.deadline).toISOString().split('T')[0]);
      setIsCompleted(task.isCompleted);
    }
  }, [task]);

  // Fix: authorId is a TaskAuthorRefDto object, compare via _id
  const isAuthor = useMemo(
    () => Boolean(task && currentUser && task.authorId._id === currentUser._id),
    [task, currentUser],
  );

  const invalidateTaskCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getTasksControllerFindOneQueryKey(taskId) });
    queryClient.invalidateQueries({ queryKey: getTasksControllerFindAllQueryKey() });
  }, [queryClient, taskId]);

  const handleSave = () => {
    if (!taskId || !task) return;

    updateTask(
      {
        id: taskId,
        data: {
          description,
          deadline: toISOString(deadline),
          estimateHours: task.estimateHours,
          isCompleted,
        },
      },
      {
        onSuccess: () => {
          invalidateTaskCache();
          toast.success('Изменения сохранены');
        },
        onError: () => {
          toast.error('Не удалось сохранить изменения');
        },
      },
    );
  };

  return {
    task: task ?? null,
    isLoading,
    isAuthor,
    description,
    setDescription,
    deadline,
    setDeadline,
    isCompleted,
    setIsCompleted,
    isUpdating,
    handleSave,
    handleNavigateBack: () => navigate(-1),
  };
};
