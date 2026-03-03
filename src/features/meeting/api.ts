/**
 * Meeting feature API layer.
 *
 * All functions are thin, semantic wrappers around the generated Orval client.
 * We never call customInstance directly from components or hooks.
 *
 * Why not use the generated hook directly for getAllSubmissions?
 * The generated client types the response as `void` because the OpenAPI spec
 * omits the response schema for that endpoint. We cast at this network boundary
 * so every consumer above is fully typed without carrying a generic cast.
 */

import { customInstance } from '@/src/shared/api/axios-instance';
import type { MeetingSubmissionsResponse } from './types';

/**
 * Fetches all phase submissions for a given meeting.
 * The cast from `void` to `MeetingSubmissionsResponse` is intentional and
 * isolated here — it is the single point of truth for this contract.
 */
export const getMeetingSubmissions = (
  meetingId: string,
  signal?: AbortSignal,
): Promise<MeetingSubmissionsResponse> =>
  customInstance<MeetingSubmissionsResponse>({
    url: `/meetings/${meetingId}/all-submissions`,
    method: 'GET',
    signal,
  });
