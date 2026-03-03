import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { getMeetingSubmissions } from './api';
import type { MeetingSubmissionsResponse } from './types';

// ─── Query key factory ────────────────────────────────────────────────────────
//
// Centralised here so cache invalidations are trivially correct across the app.
// Pattern: ['meeting', meetingId, scope] keeps keys hierarchical — invalidating
// ['meeting', meetingId] will bust all scopes for that meeting at once.

export const meetingQueryKeys = {
  all: ['meeting'] as const,
  byId: (meetingId: string) => ['meeting', meetingId] as const,
  submissions: (meetingId: string) => ['meeting', meetingId, 'submissions'] as const,
} as const;

// ─── Hooks ────────────────────────────────────────────────────────────────────

type SubmissionsQueryOptions = Omit<
  UseQueryOptions<MeetingSubmissionsResponse>,
  'queryKey' | 'queryFn' | 'enabled'
>;

/**
 * Fetches all phase submissions for a meeting.
 *
 * Suspense-compatible — wrap the consumer in <Suspense> and pass
 * `{ suspense: true }` in the options arg to opt in.
 *
 * The query key `['meeting', meetingId, 'submissions']` is stable and
 * predictable, allowing targeted invalidation after approve/reject mutations.
 */
export const useMeetingSubmissions = (
  meetingId: string,
  options?: SubmissionsQueryOptions,
): UseQueryResult<MeetingSubmissionsResponse> =>
  useQuery<MeetingSubmissionsResponse>({
    queryKey: meetingQueryKeys.submissions(meetingId),
    queryFn: ({ signal }) => getMeetingSubmissions(meetingId, signal),
    enabled: Boolean(meetingId),
    staleTime: 30_000,
    ...options,
  });
