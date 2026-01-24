/**
 * Types for TaskDetail feature
 */

import { TaskResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

export interface TaskDetailViewModel {
  // Data
  task: TaskResponseDto | null;
  isLoading: boolean;
  
  // Permissions
  isAuthor: boolean;
  
  // Form state (for editing)
  description: string;
  setDescription: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  
  // Mutation state
  isUpdating: boolean;
  
  // Handlers
  handleSave: () => void;
  handleNavigateBack: () => void;
}
