/**
 * Domain types for the meeting submissions feature.
 *
 * Relationship to generated types:
 *   - MeetingParticipantRefDto is imported from generated — never redeclared.
 *   - All other types here describe the /all-submissions response body, which the
 *     OpenAPI spec leaves as `void`. They are the authoritative frontend contracts.
 */

import type { MeetingParticipantRefDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

// ─── Shared primitives ────────────────────────────────────────────────────────

/**
 * Compact participant reference used in nested evaluation entries
 * (no email, matches the backend's CompactParticipantRefDto shape).
 */
export interface ParticipantCompactRef {
  _id: string;
  fullName: string | null;
}

// ─── Emotional evaluation ─────────────────────────────────────────────────────

export interface EmotionalEvaluationEntry {
  targetParticipant: ParticipantCompactRef;
  emotionalScale: number;
  isToxic: boolean;
}

export interface EmotionalSubmission {
  participant: MeetingParticipantRefDto;
  submitted: boolean;
  submittedAt: string;
  evaluations: EmotionalEvaluationEntry[];
}

// ─── Understanding & Contribution ─────────────────────────────────────────────

export interface ContributionEntry {
  participant: ParticipantCompactRef;
  contributionPercentage: number;
}

export interface UnderstandingSubmission {
  participant: MeetingParticipantRefDto;
  submitted: boolean;
  submittedAt: string;
  understandingScore: number;
  contributions: ContributionEntry[];
}

// ─── Task submission ──────────────────────────────────────────────────────────
//
// Field names intentionally match the refactored Task collection schema:
//   description           (was: taskDescription)
//   contributionImportance (was: expectedContributionPercentage)
//
// These are sourced exclusively from the Task collection — Meeting no longer
// embeds task planning data, so there is no dual-write synchronisation issue.

export interface TaskSubmission {
  participant: MeetingParticipantRefDto;
  taskId: string;
  submitted: boolean;
  submittedAt: string;
  description: string;
  commonQuestion: string;
  estimateHours: number;
  approved: boolean;
  deadline: string;
  contributionImportance: number;
  isCompleted: boolean;
}

// ─── Task evaluation ──────────────────────────────────────────────────────────

export interface TaskEvaluationEntry {
  taskAuthor: ParticipantCompactRef;
  importanceScore: number;
}

export interface TaskEvaluationSubmission {
  participant: MeetingParticipantRefDto;
  submitted: boolean;
  submittedAt: string;
  evaluations: TaskEvaluationEntry[];
}

// ─── Root response ────────────────────────────────────────────────────────────

export interface MeetingSubmissions {
  emotional_evaluation: Record<string, EmotionalSubmission>;
  understanding_contribution: Record<string, UnderstandingSubmission>;
  task_planning: Record<string, TaskSubmission>;
  task_evaluation: Record<string, TaskEvaluationSubmission>;
}

export interface MeetingSubmissionsResponse {
  meetingId: string;
  submissions: MeetingSubmissions;
}
