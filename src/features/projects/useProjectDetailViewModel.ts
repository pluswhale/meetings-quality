import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsControllerFindOne } from '@/src/shared/api/generated/projects/projects';
import { useMeetingsControllerFindAll } from '@/src/shared/api/generated/meetings/meetings';
import { useTasksControllerFindAll } from '@/src/shared/api/generated/tasks/tasks';
import { MeetingsControllerFindAllFilter } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { ProjectDetailViewModel, ProjectTab } from './types';

export const useProjectDetailViewModel = (projectId: string): ProjectDetailViewModel => {
  const navigate = useNavigate();
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
    handleNavigateBack: () => navigate('/dashboard'),
  };
};
