import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  useProjectsControllerFindOne,
  useProjectsControllerRemove,
  getProjectsControllerFindAllQueryKey,
} from '@/src/shared/api/generated/projects/projects';
import { useMeetingsControllerFindAll } from '@/src/shared/api/generated/meetings/meetings';
import { useTasksControllerFindAll } from '@/src/shared/api/generated/tasks/tasks';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { MeetingsControllerFindAllFilter } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { ProjectDetailViewModel, ProjectTab } from './types';

export const useProjectDetailViewModel = (projectId: string): ProjectDetailViewModel => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProjectTab>('meetings');
  const [meetingFilter, setMeetingFilter] = useState<MeetingsControllerFindAllFilter>(
    MeetingsControllerFindAllFilter.current,
  );

  const { data: project, isLoading } = useProjectsControllerFindOne(projectId, {
    query: { enabled: Boolean(projectId) },
  });

  const { data: meetings = [], isLoading: meetingsLoading } = useMeetingsControllerFindAll(
    { projectId, filter: meetingFilter },
    { query: { enabled: Boolean(projectId) && activeTab === 'meetings' } },
  );

  const { data: tasks = [], isLoading: tasksLoading } = useTasksControllerFindAll(
    { projectId },
    { query: { enabled: Boolean(projectId) && activeTab === 'tasks' } },
  );

  const isCreator = Boolean(project && currentUser && project.creatorId._id === currentUser._id);

  const { mutate: deleteProject, isPending: isDeleting } = useProjectsControllerRemove({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getProjectsControllerFindAllQueryKey() });
        toast.success('Проект удалён');
        navigate('/dashboard');
      },
      onError: () => {
        toast.error('Не удалось удалить проект');
      },
    },
  });

  const handleDeleteProject = () => {
    if (!projectId) return;
    deleteProject({ id: projectId });
  };

  return {
    project,
    meetings,
    tasks,
    isLoading,
    meetingsLoading,
    tasksLoading,
    activeTab,
    setActiveTab,
    meetingFilter,
    setMeetingFilter,
    isCreator,
    isDeleting,
    handleDeleteProject,
    handleNavigateBack: () => navigate('/dashboard'),
  };
};
