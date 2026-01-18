
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { MeetingPhase } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, meetings, tasks, logout } = useStore();
  const [tab, setTab] = useState<'MEETINGS' | 'TASKS'>('MEETINGS');
  const [filter, setFilter] = useState<'CURRENT' | 'PAST'>('CURRENT');

  const filteredMeetings = meetings.filter(m => 
    filter === 'CURRENT' ? m.currentPhase !== MeetingPhase.FINISHED : m.currentPhase === MeetingPhase.FINISHED
  );

  const filteredTasks = tasks.filter(t => t.authorId === currentUser?.id);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-b md:border-r border-slate-200 p-8 flex flex-col justify-between shadow-sm z-10">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">M</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">MeetingQuality</h2>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setTab('MEETINGS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${tab === 'MEETINGS' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Встречи
            </button>
            <button 
              onClick={() => setTab('TASKS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${tab === 'TASKS' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Задачи
            </button>
          </nav>
        </div>
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 font-bold">
              {currentUser?.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {tab === 'MEETINGS' ? 'Ваши встречи' : 'Ваши задачи'}
              </h1>
              <p className="text-slate-500 mt-1">
                {tab === 'MEETINGS' ? 'Управляйте эффективностью ваших совещаний' : 'Список ваших персональных целей'}
              </p>
            </div>
            {tab === 'MEETINGS' && (
              <Link 
                to="/meeting/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Создать встречу
              </Link>
            )}
          </div>

          {tab === 'MEETINGS' && (
            <div className="mb-8 flex p-1 bg-slate-200/50 rounded-xl w-fit">
              <button 
                onClick={() => setFilter('CURRENT')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'CURRENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Активные
              </button>
              <button 
                onClick={() => setFilter('PAST')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'PAST' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Завершенные
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {tab === 'MEETINGS' ? (
              filteredMeetings.length > 0 ? (
                filteredMeetings.map(m => (
                  <Link 
                    to={`/meeting/${m.id}`}
                    key={m.id} 
                    className={`group relative overflow-hidden p-8 rounded-3xl border-2 transition-all duration-300 ${
                      m.currentPhase === MeetingPhase.FINISHED 
                        ? 'bg-slate-50 border-slate-200 grayscale-[0.5] hover:grayscale-0' 
                        : 'bg-white border-transparent shadow-xl shadow-slate-200/50 hover:shadow-blue-100 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-blue-50 transition-colors">
                         <svg className={`w-6 h-6 ${m.currentPhase === MeetingPhase.FINISHED ? 'text-slate-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                        m.currentPhase === MeetingPhase.FINISHED ? 'bg-slate-200 text-slate-500' : 'bg-green-100 text-green-700'
                      }`}>
                        {m.currentPhase === MeetingPhase.DISCUSSION && 'Обсуждение'}
                        {m.currentPhase === MeetingPhase.EVALUATION && 'Оценка'}
                        {m.currentPhase === MeetingPhase.SUMMARY && 'Итоги'}
                        {m.currentPhase === MeetingPhase.FINISHED && 'Завершена'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xl mb-2 leading-tight group-hover:text-blue-600 transition-colors">{m.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{m.question}</p>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Нет встреч в этой категории</p>
                </div>
              )
            ) : (
              filteredTasks.length > 0 ? (
                filteredTasks.map(t => (
                  <Link 
                    to={`/task/${t.id}`}
                    key={t.id} 
                    className="p-8 bg-white rounded-3xl border-2 border-transparent shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{t.description}</h3>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-6">
                      <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {t.deadline}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Важность</span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${t.contributionImportance}%` }}></div>
                        </div>
                        <span className="text-blue-600 font-black">{t.contributionImportance}%</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">У вас пока нет активных задач</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
