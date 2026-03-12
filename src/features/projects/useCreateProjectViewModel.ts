import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useProjectsControllerCreate } from '@/src/shared/api/generated/projects/projects';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import { getProjectsControllerFindAllQueryKey } from '@/src/shared/api/generated/projects/projects';
import type { CreateProjectViewModel } from './types';

export const useCreateProjectViewModel = (): CreateProjectViewModel => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

  const { data: allUsers = [], isLoading: usersLoading } = useUsersControllerFindAll();

  const { mutate: createProject, isPending: isSubmitting } = useProjectsControllerCreate({
    mutation: {
      onSuccess: (created) => {
        queryClient.invalidateQueries({ queryKey: getProjectsControllerFindAllQueryKey() });
        toast.success('Проект создан');
        navigate(`/project/${created._id}`);
      },
      onError: () => {
        toast.error('Не удалось создать проект');
      },
    },
  });

  const toggleParticipant = useCallback((id: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Введите название проекта');
      return;
    }

    createProject({
      data: {
        title: title.trim(),
        goal: goal.trim() || undefined,
        description: description.trim() || undefined,
        participantIds: selectedParticipantIds.length > 0 ? selectedParticipantIds : undefined,
      },
    });
  };

  return {
    title,
    setTitle,
    goal,
    setGoal,
    description,
    setDescription,
    selectedParticipantIds,
    toggleParticipant,
    allUsers,
    usersLoading,
    isSubmitting,
    handleSubmit,
    handleNavigateBack: () => navigate('/dashboard'),
  };
};
