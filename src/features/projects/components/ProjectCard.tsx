import React from 'react';
import { Link } from 'react-router-dom';
import type { ProjectResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { ProjectResponseDtoStatus } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

interface ProjectCardProps {
  project: ProjectResponseDto;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const participantCount = project.participantIds.length;
  const isArchived = project.status === ProjectResponseDtoStatus.archived;

  return (
    <Link to={`/project/${project._id}`} className="block group">
      <article className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors truncate">
              {project.title}
            </h3>
            {project.goal && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {project.goal}
              </p>
            )}
          </div>
          {isArchived && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              Архив
            </span>
          )}
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {project.creatorId.fullName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-500 truncate">{project.creatorId.fullName}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-1 border-t border-slate-50 mt-auto">
          <Stat icon={<PeopleIcon />} value={participantCount} label="участников" />
        </div>
      </article>
    </Link>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Stat: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <div className="flex items-center gap-1.5 text-slate-500">
    <span className="w-3.5 h-3.5">{icon}</span>
    <span className="text-xs font-medium">
      {value} {label}
    </span>
  </div>
);

const PeopleIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
