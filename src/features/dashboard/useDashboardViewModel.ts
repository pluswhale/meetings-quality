import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { useMeetingsControllerFindAll } from '@/src/shared/api/generated/meetings/meetings';
import { useProjectsControllerFindAll } from '@/src/shared/api/generated/projects/projects';
import {
  MeetingsControllerFindAllFilter,
  ProjectsControllerFindAllStatus,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { DashboardViewModel, DashboardTab } from './types';

export const useDashboardViewModel = (): DashboardViewModel => {
  const { currentUser, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = (searchParams.get('tab') as DashboardTab) || DashboardTab.PROJECTS;

  const setTab = (newTab: DashboardTab) => {
    setSearchParams({ tab: newTab });
  };

  const [projectStatus, setProjectStatus] = useState<
    ProjectsControllerFindAllStatus | undefined
  >(undefined);

  const [meetingFilter, setMeetingFilter] = useState<MeetingsControllerFindAllFilter>(
    MeetingsControllerFindAllFilter.current,
  );

  const { data: projects = [], isLoading: projectsLoading } = useProjectsControllerFindAll(
    projectStatus ? { status: projectStatus } : undefined,
    { query: { enabled: currentTab === DashboardTab.PROJECTS } },
  );

  const { data: meetings = [], isLoading: meetingsLoading } = useMeetingsControllerFindAll(
    { filter: meetingFilter },
    { query: { enabled: currentTab === DashboardTab.MEETINGS } },
  );

  return {
    currentUser,
    currentTab,
    setTab,
    projects,
    projectsLoading,
    projectStatus,
    setProjectStatus,
    meetings,
    meetingsLoading,
    meetingFilter,
    setMeetingFilter,
    handleLogout: logout,
  };
};
