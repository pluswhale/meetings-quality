import React from 'react';
import { Link } from 'react-router-dom';
import type { TaskResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { formatDate } from '@/src/shared/lib';

interface ProjectTasksTabProps {
  tasks: TaskResponseDto[];
  isLoading: boolean;
}

export const ProjectTasksTab: React.FC<ProjectTasksTabProps> = ({ tasks, isLoading }) => {
  if (isLoading) return <LoadingSkeleton count={4} />;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 font-medium">Задач нет</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task._id} task={task} />
      ))}
    </div>
  );
};

// ─── Task row ─────────────────────────────────────────────────────────────────

const TaskRow: React.FC<{ task: TaskResponseDto }> = ({ task }) => (
  <Link to={`/task/${task._id}`} className="block group">
    <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 hover:border-slate-200 hover:shadow-sm transition-all flex items-center gap-4">
      {/* Status dot */}
      <div
        className={`shrink-0 w-2 h-2 rounded-full ${
          task.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate transition-colors group-hover:text-blue-600 ${
          task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
        }`}>
          {task.description}
        </p>
        {task.authorId.fullName && (
          <p className="text-xs text-slate-400 mt-0.5">{task.authorId.fullName}</p>
        )}
      </div>

      {/* Deadline */}
      <div className="shrink-0 text-right">
        <p className="text-xs text-slate-400">{formatDate(task.deadline)}</p>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${
          task.isCompleted ? 'text-emerald-500' : 'text-amber-500'
        }`}>
          {task.isCompleted ? 'Завершена' : 'В процессе'}
        </span>
      </div>
    </div>
  </Link>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const LoadingSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white border border-slate-100 rounded-xl px-5 py-4 animate-pulse flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-slate-100 shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
        </div>
        <div className="h-3 bg-slate-100 rounded-lg w-16" />
      </div>
    ))}
  </div>
);
