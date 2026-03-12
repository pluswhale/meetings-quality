import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/shared/ui';
import {
  MeetingResponseDtoCurrentPhase,
  ProjectResponseDtoStatus,
  ProjectsControllerFindAllStatus,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PHASE_LABELS } from '@/src/shared/constants';
import { formatDate } from '@/src/shared/lib';
import { useDashboardViewModel } from './useDashboardViewModel';
import { DashboardSidebar } from './components/DashboardSidebar';
import { MeetingsFilter } from './components/MeetingsFilter';
import { DashboardTab } from './types';
import { ProjectCard } from '../projects/components/ProjectCard';

export const DashboardView: React.FC = () => {
  const vm = useDashboardViewModel();

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar
        currentTab={vm.currentTab}
        onTabChange={vm.setTab}
        onLogout={vm.handleLogout}
        userName={vm.currentUser?.fullName}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* ─── Projects tab ───────────────────────────────── */}
          {vm.currentTab === DashboardTab.PROJECTS && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Проекты</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Ваши рабочие пространства</p>
                </div>
                <Link
                  to="/project/create"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Новый проект
                </Link>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-2 mb-6">
                <FilterPill
                  active={vm.projectStatus === undefined}
                  onClick={() => vm.setProjectStatus(undefined)}
                >
                  Все
                </FilterPill>
                <FilterPill
                  active={vm.projectStatus === ProjectsControllerFindAllStatus.current}
                  onClick={() => vm.setProjectStatus(ProjectsControllerFindAllStatus.current)}
                >
                  Текущие
                </FilterPill>
                <FilterPill
                  active={vm.projectStatus === ProjectsControllerFindAllStatus.archived}
                  onClick={() => vm.setProjectStatus(ProjectsControllerFindAllStatus.archived)}
                >
                  Архив
                </FilterPill>
              </div>

              {vm.projectsLoading ? (
                <ProjectsGrid>
                  {[1, 2, 3, 4].map((i) => (
                    <ProjectSkeleton key={i} />
                  ))}
                </ProjectsGrid>
              ) : vm.projects.length === 0 ? (
                <EmptyState
                  icon={<FolderIcon />}
                  title="Нет проектов"
                  subtitle="Создайте первый проект, чтобы начать"
                />
              ) : (
                <ProjectsGrid>
                  {vm.projects.map((p) => (
                    <ProjectCard key={p._id} project={p} />
                  ))}
                </ProjectsGrid>
              )}
            </>
          )}

          {/* ─── Meetings tab ───────────────────────────────── */}
          {vm.currentTab === DashboardTab.MEETINGS && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Встречи</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Все ваши встречи</p>
                </div>
                <Link
                  to="/meeting/create"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Создать встречу
                </Link>
              </div>

              <div className="mb-6">
                <MeetingsFilter currentFilter={vm.meetingFilter} onFilterChange={vm.setMeetingFilter} />
              </div>

              {vm.meetingsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <MeetingSkeleton key={i} />)}
                </div>
              ) : vm.meetings.length === 0 ? (
                <EmptyState
                  icon={<CalendarIcon />}
                  title="Встреч не найдено"
                  subtitle="Создайте встречу или измените фильтр"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vm.meetings.map((m) => (
                    <Link key={m._id} to={`/meeting/${m._id}`} className="block group">
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-sm transition-all flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {m.title}
                          </p>
                          <span
                            className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              m.currentPhase === MeetingResponseDtoCurrentPhase.finished
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {PHASE_LABELS[m.currentPhase]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{formatDate(m.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProjectsGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
);

const FilterPill: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
      active
        ? 'bg-slate-900 text-white'
        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
      {icon}
    </div>
    <p className="text-base font-semibold text-slate-700 mb-1">{title}</p>
    <p className="text-sm text-slate-400">{subtitle}</p>
  </div>
);

const ProjectSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse space-y-3">
    <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
    <div className="h-3 bg-slate-100 rounded-lg w-full" />
    <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
    <div className="flex gap-2 pt-2">
      <div className="h-6 bg-slate-100 rounded-full w-16" />
      <div className="h-6 bg-slate-100 rounded-full w-16" />
    </div>
  </div>
);

const MeetingSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3">
    <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
    <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
  </div>
);

const FolderIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
