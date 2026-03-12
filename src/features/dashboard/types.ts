/**
 * Types for Dashboard feature
 */

import type {
  MeetingResponseDto,
  ProjectResponseDto,
  MeetingsControllerFindAllFilter,
  ProjectsControllerFindAllStatus,
  UserResponseDto,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

export enum DashboardTab {
  PROJECTS = 'PROJECTS',
  MEETINGS = 'MEETINGS',
}

export interface DashboardViewModel {
  currentUser: UserResponseDto | null;

  currentTab: DashboardTab;
  setTab: (tab: DashboardTab) => void;

  // Projects tab
  projects: ProjectResponseDto[];
  projectsLoading: boolean;
  projectStatus: ProjectsControllerFindAllStatus | undefined;
  setProjectStatus: (s: ProjectsControllerFindAllStatus | undefined) => void;

  // Meetings tab
  meetings: MeetingResponseDto[];
  meetingsLoading: boolean;
  meetingFilter: MeetingsControllerFindAllFilter;
  setMeetingFilter: (f: MeetingsControllerFindAllFilter) => void;

  handleLogout: () => void;
}
