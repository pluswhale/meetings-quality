/**
 * Types for Dashboard feature
 */

import {
  MeetingResponseDto,
  TaskResponseDto,
  MeetingsControllerFindAllFilter,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

export enum DashboardTab {
  MEETINGS = 'MEETINGS',
  TASKS = 'TASKS',
}

export interface DashboardViewModel {
  // User data
  currentUser: any;

  // Tab state
  currentTab: DashboardTab;
  setTab: (tab: DashboardTab) => void;

  // Filter state
  filter: MeetingsControllerFindAllFilter;
  setFilter: (filter: MeetingsControllerFindAllFilter) => void;

  // Data
  meetings: MeetingResponseDto[];
  tasks: TaskResponseDto[];

  // Loading state
  meetingsLoading: boolean;
  tasksLoading: boolean;

  // Handlers
  handleLogout: () => void;
}
