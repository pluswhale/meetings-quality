import React from 'react';
import type { ProjectParticipantRefDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

interface ProjectParticipantsTabProps {
  participants: ProjectParticipantRefDto[];
  creatorId: ProjectParticipantRefDto;
}

export const ProjectParticipantsTab: React.FC<ProjectParticipantsTabProps> = ({
  participants,
  creatorId,
}) => {
  if (participants?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-slate-500 font-medium">Нет участников</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map((p) => (
        <ParticipantRow key={p._id} participant={p} isCreator={p._id === creatorId._id} />
      ))}
    </div>
  );
};

// ─── Participant row ──────────────────────────────────────────────────────────

const ParticipantRow: React.FC<{
  participant: ProjectParticipantRefDto;
  isCreator: boolean;
}> = ({ participant, isCreator }) => {
  console.log('participant', participant);

  const initials = participant.fullName
    ?.split(' ')
    ?.map((n) => n.charAt(0).toUpperCase())
    ?.slice(0, 2)
    .join('');

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-100 rounded-xl">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{participant.fullName}</p>
        <p className="text-xs text-slate-400 truncate">{participant.email}</p>
      </div>

      {/* Role badge */}
      {isCreator && (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Создатель
        </span>
      )}
    </div>
  );
};
