/**
 * Manual API client for Task Evaluation endpoints
 * These will be replaced when OpenAPI spec is updated and orval regenerates
 */

import { customInstance } from '@/src/shared/api/axios-instance';
import { MeetingResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

export interface TaskImportanceEvaluationItem {
  taskAuthorId: string;
  importanceScore: number; // 0-100
}

export interface SubmitTaskEvaluationDto {
  evaluations: TaskImportanceEvaluationItem[];
}

export interface TaskEvaluationAnalyticsItem {
  taskAuthor: {
    _id: string;
    fullName: string;
    email: string;
  };
  taskDescription: string;
  commonQuestion: string;
  originalContributionPercentage: number;
  evaluations: {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
    scores: number[];
  };
  evaluationDifference: number; // avg - original (shows over/underestimation)
}

export interface TaskEvaluationAnalyticsResponse {
  meetingId: string;
  meetingTitle: string;
  totalTasks: number;
  totalEvaluators: number;
  taskAnalytics: TaskEvaluationAnalyticsItem[];
}

/**
 * Submit task importance evaluations
 * Available for all participants + creator
 */
export const submitTaskEvaluation = async (
  meetingId: string,
  data: SubmitTaskEvaluationDto
) => {
  return customInstance<MeetingResponseDto>({
    url: `/meetings/${meetingId}/task-evaluations`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
};

/**
 * Get task evaluation analytics (creator only)
 * Shows aggregated statistics and comparisons
 */
export const getTaskEvaluationAnalytics = async (meetingId: string) => {
  return customInstance<TaskEvaluationAnalyticsResponse>({
    url: `/meetings/${meetingId}/task-evaluation-analytics`,
    method: 'GET',
  });
};
