import React from 'react';
import { Link } from 'react-router-dom';
import type {
  MeetingResponseDto,
  MeetingsControllerFindAllFilter,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import {
  MeetingResponseDtoCurrentPhase,
  MeetingsControllerFindAllFilter as FilterEnum,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PHASE_LABELS } from '@/src/shared/constants';
import { formatDate } from '@/src/shared/lib';

interface ProjectMeetingsTabProps {
  meetings: MeetingResponseDto[];
  isLoading: boolean;
  filter: MeetingsControllerFindAllFilter;
  onFilterChange: (f: MeetingsControllerFindAllFilter) => void;
}

const FILTER_OPTIONS: { value: MeetingsControllerFindAllFilter; label: string }[] = [
  { value: FilterEnum.current, label: 'Текущие' },
  { value: FilterEnum.upcoming, label: 'Предстоящие' },
  { value: FilterEnum.past, label: 'Прошедшие' },
];

export const ProjectMeetingsTab: React.FC<ProjectMeetingsTabProps> = ({
  meetings,
  isLoading,
  filter,
  onFilterChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === opt.value
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : meetings.length === 0 ? (
        <EmptyState label="Встреч не найдено" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <MeetingRow key={m._id} meeting={m} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Meeting row card ─────────────────────────────────────────────────────────

const MeetingRow: React.FC<{ meeting: MeetingResponseDto }> = ({ meeting }) => {
  const isFinished = meeting.currentPhase === MeetingResponseDtoCurrentPhase.finished;

  return (
    <Link to={`/meeting/${meeting._id}`} className="block group">
      <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-200 hover:shadow-sm transition-all flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {meeting.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(meeting.createdAt)}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            isFinished
              ? 'bg-slate-100 text-slate-500'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          {PHASE_LABELS[meeting.currentPhase]}
        </span>
      </div>
    </Link>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const LoadingSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4 mb-2" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
      </div>
    ))}
  </div>
);
