/**
 * ViewModel for Dashboard
 * Contains all business logic for dashboard functionality
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { useMeetingsControllerFindAll } from '@/src/shared/api/generated/meetings/meetings';
import { useTasksControllerFindAll } from '@/src/shared/api/generated/tasks/tasks';
import {
  MeetingResponseDtoCurrentPhase,
  MeetingsControllerFindAllFilter,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { DashboardViewModel, DashboardTab } from './types';

export const useDashboardViewModel = (): DashboardViewModel => {
  const { currentUser, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state
  const currentTab =
    (searchParams.get('tab') as DashboardTab) || DashboardTab.MEETINGS;

  const setTab = (newTab: DashboardTab) => {
    setSearchParams({ tab: newTab });
  };

  // Filter state
  const [filter, setFilter] = useState<MeetingsControllerFindAllFilter>(
    MeetingsControllerFindAllFilter.current
  );

  // Fetch data
  const {
    data: meetings = [],
    isLoading: meetingsLoading,
  } = useMeetingsControllerFindAll();

  const { data: tasks = [], isLoading: tasksLoading } = useTasksControllerFindAll();

  // Filter meetings
  const filteredMeetings = useMemo(
    () =>
      meetings.filter((m) =>
        filter === MeetingsControllerFindAllFilter.current
          ? m.currentPhase !== MeetingResponseDtoCurrentPhase.finished
          : m.currentPhase === MeetingResponseDtoCurrentPhase.finished
      ),
    [meetings, filter]
  );



  // Handlers
  const handleLogout = () => {
    logout();
  };

  return {
    currentUser,
    currentTab,
    setTab,
    filter,
    setFilter,
    meetings,
    tasks,
    filteredMeetings,
    meetingsLoading,
    tasksLoading,
    handleLogout,
  };
};
