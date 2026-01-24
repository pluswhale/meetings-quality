/**
 * VotingStatusPanel - Container for all voting status components
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { VotingProgressBar } from './VotingProgressBar';
import { ParticipantStatusCard } from './ParticipantStatusCard';
import { AllSubmittedBanner } from './AllSubmittedBanner';

interface VotingInfo {
  submissionStatus?: {
    submitted?: string[];
  };
  participants?: Array<{ _id: string }>;
}

interface VotingStatusPanelProps {
  votingInfo: VotingInfo | null;
  participants: UserResponseDto[];
}

export const VotingStatusPanel: React.FC<VotingStatusPanelProps> = ({
  votingInfo,
  participants,
}) => {
  if (!votingInfo) {
    return (
      <div className="text-sm bg-white p-6 rounded-2xl text-slate-500 text-center">
        Загрузка данных о голосовании...
      </div>
    );
  }

  const submittedCount = votingInfo.submissionStatus?.submitted?.length || 0;
  const totalCount = votingInfo.participants?.length || 0;
  const allSubmitted = submittedCount === totalCount && totalCount > 0;

  return (
    <div className="space-y-6">
      <VotingProgressBar submitted={submittedCount} total={totalCount} />

      <div className="space-y-3">
        {participants.map((participant) => {
          const hasSubmitted = votingInfo.submissionStatus?.submitted?.includes(participant._id);
          return (
            <ParticipantStatusCard
              key={participant._id}
              participant={participant}
              hasSubmitted={!!hasSubmitted}
            />
          );
        })}
      </div>

      {allSubmitted && <AllSubmittedBanner />}
    </div>
  );
};
