/**
 * Utility functions for meetings
 */

import {
  MeetingResponseDto,
  MeetingResponseDtoCurrentPhase,
  ChangePhaseDtoPhase,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PHASE_ORDER } from '@/src/shared/constants/meetings';

/**
 * Check if user is creator of the meeting
 */
export const isUserCreator = (meeting: MeetingResponseDto | null, userId: string | undefined): boolean => {
  if (!meeting || !userId) return false;
  return meeting.creatorId._id === userId;
};

/**
 * Get the next phase in the sequence
 */
export const getNextPhase = (currentPhase: MeetingResponseDtoCurrentPhase): ChangePhaseDtoPhase | null => {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === PHASE_ORDER.length - 1) {
    return null;
  }
  return PHASE_ORDER[currentIndex + 1] as ChangePhaseDtoPhase;
};

/**
 * Get current phase index
 */
export const getPhaseIndex = (phase: MeetingResponseDtoCurrentPhase): number => {
  return PHASE_ORDER.indexOf(phase);
};

/**
 * Check if phase is finished
 */
export const isPhaseFinished = (phase: MeetingResponseDtoCurrentPhase): boolean => {
  return phase === MeetingResponseDtoCurrentPhase.finished;
};

/**
 * Validate contribution total
 */
export const isContributionTotalValid = (contributions: Record<string, number>, tolerance = 0.1): boolean => {
  const total = Object.values(contributions).reduce((sum, val) => sum + val, 0);
  return Math.abs(total - 100) < tolerance;
};

/**
 * Calculate contribution total
 */
export const calculateContributionTotal = (contributions: Record<string, number>): number => {
  return Object.values(contributions).reduce((sum, val) => sum + val, 0);
};
