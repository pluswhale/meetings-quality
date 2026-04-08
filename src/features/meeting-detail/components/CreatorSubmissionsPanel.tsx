/**
 * CreatorSubmissionsPanel
 *
 * Legacy adapter — routes to CreatorAdminPanel which reads from the votes map.
 * Kept for backward compatibility with MeetingDetailView.
 */

import React from 'react';
import type { MeetingSubmissions } from '@/src/features/meeting/types';
import { CreatorAdminPanel } from './CreatorAdminPanel';
import type { UseMeetingSocketReturn } from '../hooks/useMeetingSocket';

interface CreatorSubmissionsPanelProps {
  meetingId: string;
  submissions: MeetingSubmissions | null;
  isLoading?: boolean;
  socket: UseMeetingSocketReturn;
}

export const CreatorSubmissionsPanel: React.FC<CreatorSubmissionsPanelProps> = ({
  meetingId,
  socket,
}) => {
  return <CreatorAdminPanel meetingId={meetingId} socket={socket} />;
};
