
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { MeetingPhase, EvaluationRecord } from '../types';

export const MeetingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, currentUser, updateMeetingPhase, submitEvaluation, evaluations } = useStore();
  const meeting = meetings.find(m => m.id === id);
  const isCreator = meeting?.creatorId === currentUser?.id;

  const [record, setRecord] = useState<EvaluationRecord>(() => {
    const existing = evaluations.find(e => e.meetingId === id && e.userId === currentUser?.id);
    return existing || {
      userId: currentUser?.id || '',
      meetingId: id || '',
      understandingScore: 50,
      influenceScores: {},
      emotionalImpacts: {},
      toxicParticipants: [],
    };
  });

  if (!meeting) return <div className="p-20 text-center text-slate-500 font-bold">Встреча не найдена</div>;

  const phases = [
    { key: MeetingPhase.DISCUSSION, label: 'Обсуждение' },
    { key: MeetingPhase.EVALUATION, label: 'Оценка' },
    { key: MeetingPhase.SUMMARY, label: 'Итоги' }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.key === meeting.currentPhase);

  const nextPhase = () => {
    if (!id) return;
    if (meeting.currentPhase === MeetingPhase.DISCUSSION) updateMeetingPhase(id, MeetingPhase.EVALUATION);
    else if (meeting.currentPhase === MeetingPhase.EVALUATION) updateMeetingPhase(id, MeetingPhase.SUMMARY);
    else if (meeting.currentPhase === MeetingPhase.SUMMARY) updateMeetingPhase(id, MeetingPhase.FINISHED);
  };

  const handleSaveEval = () => {
    submitEvaluation(record);
    alert('Прогресс сохранен');
  };

  const mockParticipants = [
    { id: 'p1', name: 'Иван Петров' },
    { id: 'p2', name: 'Анна Сидорова' },
    { id: 'p3', name: 'Дмитрий Волков' }
  ].filter(p => p.id !== currentUser?.id);

  if (meeting.currentPhase === MeetingPhase.FINISHED) {
    const meetingEvals = evaluations.filter(e => e.meetingId === id);
    const avgUnderstanding = meetingEvals.length > 0 
      ? Math.round(meetingEvals.reduce((acc, curr) => acc + curr.understandingScore, 0) / meetingEvals.length)
      : 0;

    return (
      <div className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <button onClick={() => navigate('/dashboard')} className="group text-slate-500 mb-8 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Назад к дашборду
        </button>
        
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Архив</div>
            <span className="text-slate-400 text-sm font-medium">{new Date(meeting.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">{meeting.title}</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="md:col-span-2 p-10 bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Средний показатель понимания</h3>
             <div className="flex items-end gap-6">
                <span className="text-8xl font-black text-slate-900 tabular-nums leading-none">{avgUnderstanding}%</span>
                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                   <div className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: `${avgUnderstanding}%` }} />
                </div>
             </div>
          </div>
          <div className="p-10 bg-blue-600 rounded-[40px] text-white shadow-xl shadow-blue-200">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-6">Участников</h3>
            <p className="text-7xl font-black">{meetingEvals.length}</p>
            <p className="mt-4 text-blue-100 font-medium">Предоставили данные для анализа</p>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          Подробный отчет по участникам
          <div className="flex-1 h-px bg-slate-200" />
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetingEvals.map(ev => (
            <div key={ev.userId} className="group p-8 bg-white border border-slate-200 rounded-[32px] hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{ev.userId === currentUser?.id ? 'Вы' : ev.userId}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Оценка от {ev.userId === currentUser?.id ? 'себя' : 'системы'}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-xl">
                  {ev.understandingScore}%
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {ev.toxicParticipants.length > 0 && (
                     <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                       Токсичность
                     </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                     Вклад: {ev.contributionImportance}%
                  </span>
                </div>
                
                {ev.taskDescription && (
                  <div className="relative mt-4 p-6 bg-slate-50 rounded-2xl border-l-4 border-blue-600 overflow-hidden">
                    <svg className="absolute top-2 right-2 w-12 h-12 text-blue-100 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Принятая задача</p>
                    <p className="text-slate-800 font-bold leading-relaxed">"{ev.taskDescription}"</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Срок: {ev.deadline}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 pb-40">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="flex-1">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 mb-6 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Вернуться
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">{meeting.title}</h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span>#{id}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>{new Date(meeting.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        {/* Visual Stepper */}
        <div className="flex items-center gap-3">
          {phases.map((p, i) => (
            <React.Fragment key={p.key}>
              <div className={`flex flex-col items-center gap-2`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 ${
                  i < currentPhaseIndex ? 'bg-green-500 text-white shadow-lg shadow-green-100' :
                  i === currentPhaseIndex ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {i < currentPhaseIndex ? '✓' : i + 1}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${i === currentPhaseIndex ? 'text-blue-600' : 'text-slate-400'}`}>
                  {p.label}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div className={`w-8 h-1 rounded-full mb-6 ${i < currentPhaseIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-12">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
          <div className="p-10 md:p-14">
            <h3 className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-[0.3em]">Центральный вопрос</h3>
            <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
              {meeting.question}
            </p>
          </div>
          {meeting.currentPhase === MeetingPhase.DISCUSSION && (
            <div className="bg-slate-50 p-8 border-t border-slate-100 flex items-center gap-4 text-slate-500 font-bold text-sm">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
               </div>
               Идет фаза активного обсуждения. Организатор переключит фазу, когда вопрос будет разобран.
            </div>
          )}
        </div>

        {meeting.currentPhase === MeetingPhase.EVALUATION && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                Ваше понимание вопроса
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100">
                <div className="flex justify-between items-center mb-10">
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Ваш уровень ясности</p>
                   <span className="text-5xl font-black text-blue-600 tabular-nums">{record.understandingScore}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                  value={record.understandingScore}
                  onChange={e => setRecord({...record, understandingScore: parseInt(e.target.value)})}
                />
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">
                  <span>Полный туман</span>
                  <span>Абсолютно ясно</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                Эмпатия и Влияние коллег
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mockParticipants.map(p => (
                  <div key={p.id} className="p-10 bg-white border border-slate-200 rounded-[40px] hover:border-blue-300 transition-all duration-300 hover:shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black">
                           {p.name.charAt(0)}
                        </div>
                        <span className="font-black text-slate-800 text-xl">{p.name}</span>
                      </div>
                      <label className="group flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          className="w-6 h-6 rounded-lg border-2 border-slate-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                          checked={record.toxicParticipants.includes(p.id)}
                          onChange={e => {
                            const toxic = e.target.checked 
                              ? [...record.toxicParticipants, p.id]
                              : record.toxicParticipants.filter(tid => tid !== p.id);
                            setRecord({...record, toxicParticipants: toxic});
                          }}
                        />
                        <span className={record.toxicParticipants.includes(p.id) ? 'text-red-500' : ''}>Токсично</span>
                      </label>
                    </div>

                    <div className="space-y-10">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Влияние на мое понимание</label>
                           <span className="text-xl font-black text-slate-900">{record.influenceScores[p.id] || 0}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-800"
                          value={record.influenceScores[p.id] || 0}
                          onChange={e => setRecord({
                            ...record, 
                            influenceScores: {...record.influenceScores, [p.id]: parseInt(e.target.value)}
                          })}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Эмоциональное воздействие</label>
                           <span className={`text-sm font-black uppercase ${ (record.emotionalImpacts[p.id] || 0) > 0 ? 'text-green-600' : 'text-red-500' }`}>
                              {(record.emotionalImpacts[p.id] || 0) > 0 ? 'Позитив' : 'Негатив'}
                           </span>
                        </div>
                        <input 
                          type="range" min="-50" max="50" 
                          className="w-full h-3 bg-gradient-to-r from-red-500 via-slate-200 to-green-500 rounded-full appearance-none cursor-pointer accent-white border border-slate-200 shadow-sm"
                          value={record.emotionalImpacts[p.id] || 0}
                          onChange={e => setRecord({
                            ...record, 
                            emotionalImpacts: {...record.emotionalImpacts, [p.id]: parseInt(e.target.value)}
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <div className="flex justify-center pt-8">
              <button onClick={handleSaveEval} className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:-translate-y-1">
                Зафиксировать оценки
              </button>
            </div>
          </div>
        )}

        {meeting.currentPhase === MeetingPhase.SUMMARY && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                Личная дорожная карта
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="p-10 md:p-14 bg-white border border-slate-200 rounded-[40px] shadow-2xl shadow-slate-200/50 space-y-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Формулировка вашей задачи</label>
                  <textarea
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 text-lg font-bold transition-all outline-none placeholder:text-slate-300"
                    rows={4}
                    placeholder="Например: Разработать архитектуру бэкенда для модуля уведомлений..."
                    value={record.taskDescription || ''}
                    onChange={e => setRecord({...record, taskDescription: e.target.value})}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Крайний срок (Дедлайн)</label>
                    <input
                      type="date"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[20px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none"
                      value={record.deadline || ''}
                      onChange={e => setRecord({...record, deadline: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Важность вашего вклада</label>
                       <span className="text-blue-600 font-black text-xl">{record.contributionImportance || 0}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      className="w-full h-10 accent-blue-600 cursor-pointer"
                      value={record.contributionImportance || 0}
                      onChange={e => setRecord({...record, contributionImportance: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </section>
            
            <div className="flex justify-center pt-4">
              <button onClick={handleSaveEval} className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:-translate-y-1">
                Подтвердить результаты
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Creator Control Bar */}
      {isCreator && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] z-50">
          <div className="flex items-center justify-between gap-6">
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Панель управления</p>
              <p className="text-white text-sm font-bold truncate">Переключить фазу встречи</p>
            </div>
            <button 
              onClick={nextPhase}
              className="flex-1 md:flex-none px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-blue-900/40"
            >
              {meeting.currentPhase === MeetingPhase.DISCUSSION && 'Начать оценку →'}
              {meeting.currentPhase === MeetingPhase.EVALUATION && 'Перейти к итогам →'}
              {meeting.currentPhase === MeetingPhase.SUMMARY && 'Завершить встречу ✔'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
