import type {
  ProjectDetailResponseDto,
  ProjectResponseDto,
  MeetingResponseDto,
  TaskResponseDto,
  UserResponseDto,
  ProjectsControllerFindAllStatus,
  MeetingsControllerFindAllFilter,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

export type ProjectTab = 'meetings' | 'tasks' | 'participants';

// ─── List page ────────────────────────────────────────────────────────────────

export interface ProjectsListViewModel {
  projects: ProjectResponseDto[];
  isLoading: boolean;
  status: ProjectsControllerFindAllStatus | undefined;
  setStatus: (s: ProjectsControllerFindAllStatus | undefined) => void;
  handleNavigateToCreate: () => void;
}

// ─── Create page ──────────────────────────────────────────────────────────────

export interface CreateProjectViewModel {
  title: string;
  setTitle: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  selectedParticipantIds: string[];
  toggleParticipant: (id: string) => void;
  allUsers: UserResponseDto[];
  usersLoading: boolean;
  isSubmitting: boolean;
  handleSubmit: () => void;
  handleNavigateBack: () => void;
}

// ─── Detail page ──────────────────────────────────────────────────────────────

export interface ProjectDetailViewModel {
  project: ProjectDetailResponseDto | undefined;
  meetings: MeetingResponseDto[];
  tasks: TaskResponseDto[];
  isLoading: boolean;
  meetingsLoading: boolean;
  tasksLoading: boolean;
  activeTab: ProjectTab;
  setActiveTab: (tab: ProjectTab) => void;
  meetingFilter: MeetingsControllerFindAllFilter;
  setMeetingFilter: (f: MeetingsControllerFindAllFilter) => void;
  handleNavigateBack: () => void;
}
