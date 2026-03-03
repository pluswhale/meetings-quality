/**
 * Centralized query key factory for the meeting-detail feature.
 *
 * Rules:
 *   - Keys match the URL format Orval generates (`/meetings/${id}`, not `['meetings', id]`).
 *   - All invalidations in the feature reference this factory — never inline strings.
 *   - Hierarchical structure: invalidating a parent key busts all children.
 */

export const meetingDetailQueryKeys = {
  /** Matches the Orval-generated key for useMeetingsControllerFindOne. */
  meeting: (meetingId: string) => [`/meetings/${meetingId}`] as const,

  /** Matches the Orval-generated key for useMeetingsControllerGetStatistics. */
  statistics: (meetingId: string) => [`/meetings/${meetingId}/statistics`] as const,

  /** Submissions panel — creator-only polling endpoint. */
  submissions: (meetingId: string) => [`/meetings/${meetingId}/all-submissions`] as const,

  /** Pending voters — creator-only endpoint. */
  pendingVoters: (meetingId: string) => [`/meetings/${meetingId}/pending-voters`] as const,

  /** Voting info — creator-only endpoint. */
  votingInfo: (meetingId: string) => [`/meetings/${meetingId}/voting-info`] as const,

  /** Tasks collection keyed by meeting. Used for invalidation after approve/create. */
  meetingTasks: (meetingId: string) => ['/tasks', 'meeting', meetingId] as const,

  /** All tasks for the current user (populated by tasksControllerFindAll). */
  userTasks: () => ['/tasks'] as const,
} as const;
