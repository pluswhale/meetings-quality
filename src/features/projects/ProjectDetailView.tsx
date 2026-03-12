import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectDetailViewModel } from './useProjectDetailViewModel';
import { ProjectMeetingsTab } from './components/ProjectMeetingsTab';
import { ProjectTasksTab } from './components/ProjectTasksTab';
import { ProjectParticipantsTab } from './components/ProjectParticipantsTab';
import type { ProjectTab } from './types';
import { ProjectDetailResponseDtoStatus } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

const TABS: { key: ProjectTab; label: string }[] = [
  { key: 'meetings', label: 'Встречи' },
  { key: 'tasks', label: 'Задачи' },
  { key: 'participants', label: 'Участники' },
];

export const ProjectDetailView: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const vm = useProjectDetailViewModel(id);

  if (vm.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!vm.project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm font-medium">Проект не найден</p>
      </div>
    );
  }

  const isArchived = vm.project.status === ProjectDetailResponseDtoStatus.archived;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10 md:px-12">
        {/* Back */}
        <button
          onClick={vm.handleNavigateBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
        </button>

        {/* Project header */}
        <header className="bg-white border border-slate-100 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{vm.project.title}</h1>
            {isArchived && (
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Архив
              </span>
            )}
          </div>

          {vm.project.goal && (
            <p className="text-base text-slate-700 font-medium mb-3">{vm.project.goal}</p>
          )}

          {vm.project.description && (
            <p className="text-sm text-slate-500 leading-relaxed mb-5">{vm.project.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-5 pt-5 border-t border-slate-100">
            <MetaStat
              icon={<CreatorIcon />}
              label={`${vm.project.creatorId.fullName}`}
              caption="создатель"
            />
            <MetaStat
              icon={<PeopleIcon />}
              label={`${vm.project.participantIds.length}`}
              caption="участников"
            />
            <MetaStat
              icon={<MeetingIcon />}
              label={`${vm.project.meetingCount}`}
              caption="встреч"
            />
            <MetaStat
              icon={<TaskIcon />}
              label={`${vm.project.taskCount}`}
              caption="задач"
            />
          </div>
        </header>

        {/* Tabs + contextual action */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => vm.setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  vm.activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {vm.activeTab === 'meetings' && (
            <Link
              to={`/meeting/create?projectId=${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-all shadow-sm shrink-0"
            >
              <PlusIcon />
              Новая встреча
            </Link>
          )}

          {vm.activeTab === 'tasks' && (
            <Link
              to={`/task/create?projectId=${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-all shadow-sm shrink-0"
            >
              <PlusIcon />
              Новая задача
            </Link>
          )}
        </div>

        {/* Tab content */}
        {vm.activeTab === 'meetings' && (
          <ProjectMeetingsTab
            meetings={vm.meetings}
            isLoading={vm.meetingsLoading}
            filter={vm.meetingFilter}
            onFilterChange={vm.setMeetingFilter}
          />
        )}
        {vm.activeTab === 'tasks' && (
          <ProjectTasksTab tasks={vm.tasks} isLoading={vm.tasksLoading} />
        )}
        {vm.activeTab === 'participants' && (
          <ProjectParticipantsTab
            participants={vm.project.participantIds}
            creatorId={vm.project.creatorId}
          />
        )}
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetaStat: React.FC<{ icon: React.ReactNode; label: string; caption: string }> = ({
  icon,
  label,
  caption,
}) => (
  <div className="flex items-center gap-2">
    <span className="w-4 h-4 text-slate-400">{icon}</span>
    <div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="text-xs text-slate-400 ml-1">{caption}</span>
    </div>
  </div>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CreatorIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const PeopleIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);
const MeetingIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const TaskIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
