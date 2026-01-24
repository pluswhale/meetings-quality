/**
 * CreatorStatsPanels - Shows voting status and detailed submissions for creator
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { VotingStatusPanel } from '@/src/shared/components';
import { PhaseSubmissionsDisplay } from './PhaseSubmissionsDisplay';
import { VotingInfo, PhaseSubmissions } from '../types';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

interface CreatorStatsPanelsProps {
  votingInfo: VotingInfo | null;
  phaseSubmissions: PhaseSubmissions | null;
  currentPhase: MeetingResponseDtoCurrentPhase;
  participants: UserResponseDto[];
}

export const CreatorStatsPanels: React.FC<CreatorStatsPanelsProps> = ({
  votingInfo,
  phaseSubmissions,
  currentPhase,
  participants,
}) => {
  return (
    <>
      <div className="p-10 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-[40px]">
        <h3 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          Статус голосования участников
        </h3>
        <VotingStatusPanel votingInfo={votingInfo} participants={participants} />
      </div>

      {phaseSubmissions && (
        <div className="p-10 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-[40px]">
          <PhaseSubmissionsDisplay
            phaseSubmissions={phaseSubmissions}
            currentPhase={currentPhase}
            participants={participants}
          />
        </div>
      )}
    </>
  );
};
