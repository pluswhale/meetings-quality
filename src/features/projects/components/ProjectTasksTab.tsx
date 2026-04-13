import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { TaskResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import {
  useTasksControllerUpdate,
  getTasksControllerFindAllQueryKey,
} from '@/src/shared/api/generated/tasks/tasks';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { formatDate } from '@/src/shared/lib';

interface ProjectTasksTabProps {
  tasks: TaskResponseDto[];
  isLoading: boolean;
  projectId: string;
}

export const ProjectTasksTab: React.FC<ProjectTasksTabProps> = ({
  tasks,
  isLoading,
  projectId,
}) => {
  const { currentUser } = useAuthStore();

  if (isLoading) return <TableSkeleton />;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">Задач нет</p>
        <p className="text-xs text-slate-400 mt-1">Задачи появляются после фазы планирования на встрече</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8" />
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Описание</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Автор</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Дедлайн</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Часы</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Вклад</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Статус</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Одобрена</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {tasks.map((task) => (
            <TaskTableRow
              key={task._id}
              task={task}
              isOwner={task.authorId._id === currentUser?._id}
              projectId={projectId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Table row ────────────────────────────────────────────────────────────────

interface TaskTableRowProps {
  task: TaskResponseDto;
  isOwner: boolean;
  projectId: string;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({ task, isOwner, projectId }) => {
  const queryClient = useQueryClient();

  const { mutate: updateTask, isPending } = useTasksControllerUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getTasksControllerFindAllQueryKey({ projectId }),
        });
      },
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOwner || isPending) return;
    updateTask({
      id: task._id,
      data: { isCompleted: !task.isCompleted, estimateHours: task.estimateHours },
    });
  };

  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      {/* Status toggle / dot */}
      <td className="px-4 py-3">
        {isOwner ? (
          <button
            onClick={handleToggle}
            disabled={isPending}
            title={task.isCompleted ? 'Отметить как незавершённую' : 'Отметить как завершённую'}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-50 ${
              task.isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-slate-300 hover:border-green-400 bg-white'
            }`}
          >
            {task.isCompleted && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ) : (
          <div className={`w-2 h-2 rounded-full mx-auto ${task.isCompleted ? 'bg-green-400' : 'bg-blue-400'}`} />
        )}
      </td>

      {/* Description → links to detail page */}
      <td className="px-4 py-3 max-w-xs">
        <Link
          to={`/task/${task._id}`}
          className={`font-medium hover:text-blue-600 transition-colors line-clamp-2 ${
            task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}
        >
          {task.description}
        </Link>
        {isOwner && (
          <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">вы</span>
        )}
      </td>

      {/* Author */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-slate-600 whitespace-nowrap">
          {task.authorId.fullName ?? '—'}
        </span>
      </td>

      {/* Deadline */}
      <td className="px-4 py-3 hidden sm:table-cell text-slate-500 whitespace-nowrap">
        {task.deadline ? formatDate(task.deadline) : '—'}
      </td>

      {/* Estimate hours */}
      <td className="px-4 py-3 hidden lg:table-cell text-slate-500">
        {task.estimateHours}ч
      </td>

      {/* Contribution importance */}
      <td className="px-4 py-3 hidden lg:table-cell text-slate-500">
        {task.contributionImportance}%
      </td>

      {/* Status badge */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            task.isCompleted
              ? 'bg-green-50 text-green-600'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          {task.isCompleted ? 'Завершена' : 'В процессе'}
        </span>
      </td>

      {/* Approved */}
      <td className="px-4 py-3 hidden sm:table-cell">
        {task.approved ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Да
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">—</span>
        )}
      </td>
    </tr>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TableSkeleton: React.FC = () => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          {['', 'Описание', 'Автор', 'Дедлайн', 'Статус', 'Одобрена'].map((h) => (
            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="animate-pulse">
            <td className="px-4 py-3"><div className="w-5 h-5 rounded-full bg-slate-100" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-48" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-24" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-20" /></td>
            <td className="px-4 py-3"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-8" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
