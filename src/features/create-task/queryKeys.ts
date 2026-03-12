import {
  getTasksControllerFindAllQueryKey as orvalTasksKey,
} from '@/src/shared/api/generated/tasks/tasks';
import {
  getProjectsControllerFindOneQueryKey as orvalProjectKey,
} from '@/src/shared/api/generated/projects/projects';

export const getTasksControllerFindAllQueryKey = (projectId?: string) =>
  orvalTasksKey(projectId ? { projectId } : undefined);

export const getProjectsControllerFindOneQueryKey = (projectId: string) =>
  orvalProjectKey(projectId);
