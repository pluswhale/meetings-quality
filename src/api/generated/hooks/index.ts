/**
 * TEMPORARY API HOOKS
 * These will be replaced by Orval-generated React Query hooks
 * Run: npm run generate:api
 */

import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { axiosInstance } from '../../axios-instance';
import * as Models from '../models';

// Auth Hooks
export const useAuthControllerLogin = (
  options?: UseMutationOptions<Models.AuthResponseDto, Error, { data: Models.LoginDto }>
) => {
  return useMutation({
    mutationFn: async ({ data }: { data: Models.LoginDto }) => {
      const response = await axiosInstance.post<Models.AuthResponseDto>('/auth/login', data);
      return response.data;
    },
    ...options,
  });
};

export const useAuthControllerRegister = (
  options?: UseMutationOptions<Models.AuthResponseDto, Error, { data: Models.CreateUserDto }>
) => {
  return useMutation({
    mutationFn: async ({ data }: { data: Models.CreateUserDto }) => {
      const response = await axiosInstance.post<Models.AuthResponseDto>('/auth/register', data);
      return response.data;
    },
    ...options,
  });
};

export const useAuthControllerGetProfile = (
  options?: UseQueryOptions<Models.UserResponseDto, Error>
) => {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.UserResponseDto>('/auth/me');
      return response.data;
    },
    ...options,
  });
};

// Meetings Hooks
export const useMeetingsControllerFindAll = (
  params?: { filter?: 'current' | 'past' },
  options?: UseQueryOptions<Models.MeetingResponseDto[], Error>
) => {
  return useQuery({
    queryKey: ['meetings', params],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.MeetingResponseDto[]>('/meetings', { params });
      return response.data;
    },
    ...options,
  });
};

export const useMeetingsControllerFindOne = (
  id: string,
  options?: UseQueryOptions<Models.MeetingResponseDto, Error>
) => {
  return useQuery({
    queryKey: ['meetings', id],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.MeetingResponseDto>(`/meetings/${id}`);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useMeetingsControllerCreate = (
  options?: UseMutationOptions<Models.MeetingResponseDto, Error, { data: Models.CreateMeetingDto }>
) => {
  return useMutation({
    mutationFn: async ({ data }: { data: Models.CreateMeetingDto }) => {
      const response = await axiosInstance.post<Models.MeetingResponseDto>('/meetings', data);
      return response.data;
    },
    ...options,
  });
};

export const useMeetingsControllerUpdate = (
  options?: UseMutationOptions<Models.MeetingResponseDto, Error, { id: string; data: Models.UpdateMeetingDto }>
) => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Models.UpdateMeetingDto }) => {
      const response = await axiosInstance.patch<Models.MeetingResponseDto>(`/meetings/${id}`, data);
      return response.data;
    },
    ...options,
  });
};

export const useMeetingsControllerRemove = (
  options?: UseMutationOptions<void, Error, { id: string }>
) => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await axiosInstance.delete(`/meetings/${id}`);
    },
    ...options,
  });
};

export const useMeetingsControllerChangePhase = (
  options?: UseMutationOptions<Models.MeetingResponseDto, Error, { id: string; data: Models.ChangePhaseDto }>
) => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Models.ChangePhaseDto }) => {
      const response = await axiosInstance.patch<Models.MeetingResponseDto>(`/meetings/${id}/phase`, data);
      return response.data;
    },
    ...options,
  });
};

export const useMeetingsControllerSubmitEvaluation = (
  options?: UseMutationOptions<Models.MeetingResponseDto, Error, { id: string; data: Models.SubmitEvaluationDto }>
) => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Models.SubmitEvaluationDto }) => {
      const response = await axiosInstance.post<Models.MeetingResponseDto>(`/meetings/${id}/evaluations`, data);
      return response.data;
    },
    ...options,
  });
};

export const useMeetingsControllerSubmitSummary = (
  options?: UseMutationOptions<Models.MeetingResponseDto, Error, { id: string; data: Models.SubmitSummaryDto }>
) => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Models.SubmitSummaryDto }) => {
      const response = await axiosInstance.post<Models.MeetingResponseDto>(`/meetings/${id}/summaries`, data);
      return response.data;
    },
    ...options,
  });
};

export const useMeetingsControllerGetStatistics = (
  id: string,
  options?: UseQueryOptions<Models.StatisticsResponseDto, Error>
) => {
  return useQuery({
    queryKey: ['meetings', id, 'statistics'],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.StatisticsResponseDto>(`/meetings/${id}/statistics`);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

// Tasks Hooks
export const useTasksControllerFindAll = (
  params?: { filter?: 'current' | 'past' },
  options?: UseQueryOptions<Models.TaskResponseDto[], Error>
) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.TaskResponseDto[]>('/tasks', { params });
      return response.data;
    },
    ...options,
  });
};

export const useTasksControllerFindByMeeting = (
  meetingId: string,
  options?: UseQueryOptions<Models.TaskResponseDto[], Error>
) => {
  return useQuery({
    queryKey: ['tasks', 'meeting', meetingId],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.TaskResponseDto[]>(`/tasks/meeting/${meetingId}`);
      return response.data;
    },
    enabled: !!meetingId,
    ...options,
  });
};

export const useTasksControllerFindOne = (
  id: string,
  options?: UseQueryOptions<Models.TaskResponseDto, Error>
) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.TaskResponseDto>(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useTasksControllerCreate = (
  options?: UseMutationOptions<Models.TaskResponseDto, Error, { data: Models.CreateTaskDto }>
) => {
  return useMutation({
    mutationFn: async ({ data }: { data: Models.CreateTaskDto }) => {
      const response = await axiosInstance.post<Models.TaskResponseDto>('/tasks', data);
      return response.data;
    },
    ...options,
  });
};

export const useTasksControllerUpdate = (
  options?: UseMutationOptions<Models.TaskResponseDto, Error, { id: string; data: Models.UpdateTaskDto }>
) => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Models.UpdateTaskDto }) => {
      const response = await axiosInstance.patch<Models.TaskResponseDto>(`/tasks/${id}`, data);
      return response.data;
    },
    ...options,
  });
};

export const useTasksControllerRemove = (
  options?: UseMutationOptions<void, Error, { id: string }>
) => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await axiosInstance.delete(`/tasks/${id}`);
    },
    ...options,
  });
};

// Users Hooks
export const useUsersControllerFindAll = (
  options?: UseQueryOptions<Models.UserResponseDto[], Error>
) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axiosInstance.get<Models.UserResponseDto[]>('/users');
      return response.data;
    },
    ...options,
  });
};
