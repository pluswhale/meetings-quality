/**
 * ViewModel for TaskDetail
 * Contains all business logic for viewing and editing tasks
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { queryClient } from '@/src/app/providers/QueryProvider';
import {
  useTasksControllerFindOne,
  useTasksControllerUpdate,
} from '@/src/shared/api/generated/tasks/tasks';
import { TaskDetailViewModel } from './types';
import { toISOString } from '@/src/shared/lib';

export const useTaskDetailViewModel = (taskId: string): TaskDetailViewModel => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  // Fetch task data
  const { data: task, isLoading } = useTasksControllerFindOne(taskId, {
    query: {
      enabled: !!taskId,
    },
  });

  // Update mutation
  const { mutate: updateTask, isPending: isUpdating } = useTasksControllerUpdate();

  // Form state
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  // Sync form state with task data
  useEffect(() => {
    if (task) {
      setDescription(task.description);
      setDeadline(new Date(task.deadline).toISOString().split('T')[0]);
    }
  }, [task]);

  // Check if current user is author
  const isAuthor = useMemo(
    () => task?.authorId === currentUser?._id,
    [task, currentUser]
  );

  // Handlers
  const handleSave = () => {
    if (!taskId) return;

    updateTask(
      {
        id: taskId,
        data: {
          description,
          deadline: toISOString(deadline),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          toast.success('Изменения сохранены');
        },
        onError: (err: any) => {
          toast.error(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить изменения'}`);
        },
      }
    );
  };

  const handleNavigateBack = () => {
    navigate('/dashboard');
  };

  return {
    task: task || null,
    isLoading,
    isAuthor,
    description,
    setDescription,
    deadline,
    setDeadline,
    isUpdating,
    handleSave,
    handleNavigateBack,
  };
};
