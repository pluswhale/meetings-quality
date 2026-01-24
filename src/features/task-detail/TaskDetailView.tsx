/**
 * TaskDetailView - Pure presentation layer for task details
 * No business logic, only receives props and renders UI
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { useTaskDetailViewModel } from './useTaskDetailViewModel';
import { TaskForm } from './components/TaskForm';

export const TaskDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vm = useTaskDetailViewModel(id || '');
  const { currentUser } = useAuthStore();

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold">Загрузка задачи...</p>
      </div>
    );
  }

  // Task not found
  if (!vm.task) {
    return <div className="p-20 text-center text-slate-500 font-bold">Задача не найдена</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-in slide-in-from-bottom-8 duration-500">
      <button
        onClick={vm.handleNavigateBack}
        className="text-slate-500 mb-10 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Назад к списку
      </button>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Детали задачи
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Персональное задание по итогам встречи
        </p>
      </header>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 md:p-14 space-y-10">
        <TaskForm
          description={vm.description}
          onDescriptionChange={vm.setDescription}
          deadline={vm.deadline}
          onDeadlineChange={vm.setDeadline}
          contributionImportance={vm.task.contributionImportance}
          isAuthor={vm.isAuthor}
        />

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">
              Ответственный
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                {vm.isAuthor ? currentUser?.fullName.charAt(0) : 'U'}
              </div>
              <span className="text-slate-700 font-bold">
                {vm.isAuthor ? 'Вы' : vm.task.authorId}
              </span>
            </div>
          </div>
        </div>

        {vm.isAuthor && (
          <button
            onClick={vm.handleSave}
            disabled={vm.isUpdating}
            className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {vm.isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        )}
      </div>
    </div>
  );
};
