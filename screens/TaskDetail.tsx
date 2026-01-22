
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTasksControllerFindOne, useTasksControllerUpdate } from '../src/api/generated/hooks';
import { queryClient } from '../src/providers/QueryProvider';

export const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useStore();
  
  const { data: task, isLoading, error } = useTasksControllerFindOne(id || '');
  const { mutate: updateTask, isPending: isUpdating } = useTasksControllerUpdate();

  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (task) {
      setDesc(task.description);
      setDeadline(new Date(task.deadline).toISOString().split('T')[0]);
    }
  }, [task]);

  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold">Загрузка задачи...</p>
      </div>
    );
  }

  if (error || !task) {
    return <div className="p-20 text-center text-slate-500 font-bold">Задача не найдена</div>;
  }

  const isAuthor = task.authorId === currentUser?._id;

  const handleSave = () => {
    if (!id) return;
    
    updateTask(
      { 
        id, 
        data: { 
          description: desc, 
          deadline: new Date(deadline).toISOString()
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', id] });
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          alert('Изменения сохранены');
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить изменения'}`);
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-in slide-in-from-bottom-8 duration-500">
      <button onClick={() => navigate('/dashboard')} className="text-slate-500 mb-10 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Назад к списку
      </button>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">Детали задачи</h1>
        <p className="text-slate-500 text-lg font-medium">Персональное задание по итогам встречи</p>
      </header>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 md:p-14 space-y-10">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Описание задачи</label>
          {isAuthor ? (
            <textarea
              className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 text-lg font-bold transition-all outline-none leading-relaxed shadow-sm"
              rows={4}
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          ) : (
            <div className="px-8 py-6 bg-slate-50 rounded-[24px] border-l-4 border-blue-600">
              <p className="text-xl text-slate-800 font-bold leading-relaxed">{task.description}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Крайний срок</label>
            {isAuthor ? (
              <input
                type="date"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[20px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none shadow-sm"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            ) : (
              <p className="px-8 py-5 bg-slate-50 rounded-[20px] text-lg text-slate-900 font-black tracking-tight">
                {new Date(task.deadline).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Важность вклада</label>
            <div className="flex items-center gap-4 px-8 py-5 bg-blue-50 rounded-[20px]">
              <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${task.contributionImportance}%` }} />
              </div>
              <span className="text-2xl font-black text-blue-600 tabular-nums">{task.contributionImportance}%</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Ответственный</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                {isAuthor ? currentUser?.fullName.charAt(0) : 'U'}
              </div>
              <span className="text-slate-700 font-bold">{isAuthor ? 'Вы' : task.authorId}</span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <button 
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        )}
      </div>
    </div>
  );
};
