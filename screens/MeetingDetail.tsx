
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';

import { queryClient } from '../src/providers/QueryProvider';
import { useMeetingsControllerFindOne, useMeetingsControllerGetStatistics, useMeetingsControllerChangePhase, useMeetingsControllerSubmitEvaluation, useMeetingsControllerSubmitSummary } from '@/src/api/generated/meetings/meetings';
import { MeetingResponseDtoCurrentPhase, ChangePhaseDtoPhase } from '@/src/api/generated/models';

export const MeetingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useStore();

  // Fetch meeting data with polling every 2 seconds
  const { data: meeting, isLoading, error } = useMeetingsControllerFindOne(id || '', {
    query: {
      refetchInterval: 2000, // Опрашивать каждые 2 секунды
      refetchIntervalInBackground: false, // Останавливать при неактивной вкладке
    },
  });
  
  const { data: statistics } = useMeetingsControllerGetStatistics(id || '', {
    query: {
      enabled: meeting?.currentPhase === 'finished',
      refetchInterval: meeting?.currentPhase === 'finished' ? 2000 : false,
    },
  });

  // Mutations
  const { mutate: changePhase, isPending: isChangingPhase } = useMeetingsControllerChangePhase();
  const { mutate: submitEvaluation, isPending: isSubmittingEval } = useMeetingsControllerSubmitEvaluation();
  const { mutate: submitSummary, isPending: isSubmittingSummary } = useMeetingsControllerSubmitSummary();

  // Local state for evaluation form
  const [understandingScore, setUnderstandingScore] = useState(50);
  const [taskDescription, setTaskDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [contributionImportance, setContributionImportance] = useState(50);

  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold">Загрузка встречи...</p>
      </div>
    );
  }

  if (!meeting) {
    return <div className="p-20 text-center text-slate-500 font-bold">Встреча не найдена</div>;
  }

  const isCreator = meeting.creatorId._id === currentUser?._id;
  
  // Debug logging
  console.log('Meeting Creator ID:', meeting.creatorId);
  console.log('Current User ID:', currentUser?._id);
  console.log('Is Creator:', isCreator);
  console.log('Current Phase:', meeting.currentPhase);

  const phases = [
    { key: 'discussion' as MeetingResponseDtoCurrentPhase, label: 'Обсуждение' },
    { key: 'evaluation' as MeetingResponseDtoCurrentPhase, label: 'Оценка' },
    { key: 'summary' as MeetingResponseDtoCurrentPhase, label: 'Итоги' }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.key === meeting.currentPhase);

  const handleNextPhase = () => {
    if (!id) return;
    
    let nextPhase: ChangePhaseDtoPhase;
    if (meeting.currentPhase === 'discussion') nextPhase = 'evaluation';
    else if (meeting.currentPhase === 'evaluation') nextPhase = 'summary';
    else if (meeting.currentPhase === 'summary') nextPhase = 'finished';
    else return;

    changePhase(
      { id, data: { phase: nextPhase } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['meetings', id] });
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось изменить фазу'}`);
        },
      }
    );
  };

  const handleSubmitEvaluation = () => {
    if (!id) return;
    
    submitEvaluation(
      {
        id,
        data: {
          understandingScore,
          influences: [], // Mock data
          emotionalEvaluations: [], // Mock data
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['meetings', id] });
          alert('✅ Оценка сохранена!');
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить оценку'}`);
        },
      }
    );
  };

  const handleSubmitSummary = () => {
    if (!id || !taskDescription || !deadline) {
      alert('Заполните описание задачи и срок');
      return;
    }
    
    submitSummary(
      {
        id,
        data: {
          taskDescription,
          deadline: new Date(deadline).toISOString(),
          contributionImportance,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['meetings', id] });
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          alert('✅ Задача создана!');
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось создать задачу'}`);
        },
      }
    );
  };

  // Finished phase view
  if (meeting.currentPhase === 'finished' && statistics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto p-6 md:p-12"
      >
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/dashboard')}
          className="group text-slate-500 mb-8 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors"
        >
          <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад к дашборду
        </motion.button>
        
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
            >
              Архив
            </motion.div>
            <span className="text-slate-400 text-sm font-medium">
              {new Date(meeting.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            {meeting.title}
          </motion.h1>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <div className="md:col-span-2 p-10 bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              Средний показатель понимания
            </h3>
            <div className="flex items-end gap-6">
              <span className="text-8xl font-black text-slate-900 tabular-nums leading-none">
                {Math.round(statistics.avgUnderstanding)}%
              </span>
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  style={{ width: `${statistics.avgUnderstanding}%` }} 
                />
              </div>
            </div>
          </div>
          <div className="p-10 bg-blue-600 rounded-[40px] text-white shadow-xl shadow-blue-200">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-6">Участников</h3>
            <p className="text-7xl font-black">{statistics.participantStats.length}</p>
            <p className="mt-4 text-blue-100 font-medium">Предоставили данные для анализа</p>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3"
        >
          Подробный отчет по участникам
          <div className="flex-1 h-px bg-slate-200" />
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {statistics.participantStats.map((stat, index) => (
            <motion.div
              key={stat.participant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-8 bg-white border border-slate-200 rounded-[32px] hover:border-blue-300 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{stat.participant.fullName}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{stat.participant.email}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-xl">
                  {Math.round(stat.understandingScore)}%
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {stat.toxicityFlags > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      Токсичность
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                    Эмоциональная оценка:{' '}
                    {typeof stat.averageEmotionalScale === 'number'
                      ? Math.round(stat.averageEmotionalScale)
                      : '—'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // Active meeting view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-6 md:p-12 pb-40"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8"
      >
        <div className="flex-1">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 mb-6 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Вернуться
          </motion.button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">{meeting.title}</h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span>#{id}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>{new Date(meeting.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        {/* Visual Stepper */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          {phases.map((p, i) => (
            <React.Fragment key={p.key}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 ${
                  i < currentPhaseIndex ? 'bg-green-500 text-white shadow-lg shadow-green-100' :
                  i === currentPhaseIndex ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {i < currentPhaseIndex ? '✓' : i + 1}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  i === currentPhaseIndex ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {p.label}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div className={`w-8 h-1 rounded-full mb-6 ${i < currentPhaseIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-12"
      >
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
          <div className="p-10 md:p-14">
            <h3 className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-[0.3em]">Центральный вопрос</h3>
            <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
              {meeting.question}
            </p>
          </div>
          {meeting.currentPhase === 'discussion' && (
            <div className="bg-slate-50 p-8 border-t border-slate-100 flex items-center gap-4 text-slate-500 font-bold text-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              Идет фаза активного обсуждения. Организатор переключит фазу, когда вопрос будет разобран.
            </div>
          )}
        </div>

        {/* Evaluation Phase */}
        {meeting.currentPhase === 'evaluation' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                Ваше понимание вопроса
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100">
                <div className="flex justify-between items-center mb-10">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Ваш уровень ясности</p>
                  <span className="text-5xl font-black text-blue-600 tabular-nums">{understandingScore}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={understandingScore}
                  onChange={(e) => setUnderstandingScore(Number(e.target.value))}
                  className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </section>

            <button
              onClick={handleSubmitEvaluation}
              disabled={isSubmittingEval}
              className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {isSubmittingEval ? 'Сохранение...' : 'Сохранить оценку'}
            </button>
          </div>
        )}

        {/* Summary Phase */}
        {meeting.currentPhase === 'summary' && (
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                Создать задачу
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    Описание задачи
                  </label>
                  <textarea
                    rows={4}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none"
                    placeholder="Опишите задачу..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    Дедлайн
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Важность вклада
                    </label>
                    <span className="text-2xl font-black text-blue-600">{contributionImportance}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={contributionImportance}
                    onChange={(e) => setContributionImportance(Number(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </section>

            <button
              onClick={handleSubmitSummary}
              disabled={isSubmittingSummary}
              className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {isSubmittingSummary ? 'Создание...' : 'Создать задачу'}
            </button>
          </div>
        )}

        {/* Creator Controls */}
        {isCreator && meeting.currentPhase !== 'finished' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <button
              onClick={handleNextPhase}
              disabled={isChangingPhase}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-300/50 hover:shadow-3xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isChangingPhase ? 'Переключение...' : 'Следующая фаза'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        )}
        
        {/* Debug info for creator */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Meeting Creator: {meeting.creatorId}</p>
            <p>Current User: {currentUser?._id}</p>
            <p>Is Creator: {isCreator ? 'Yes' : 'No'}</p>
            <p>Current Phase: {meeting.currentPhase}</p>
            <p>Show Button: {isCreator && meeting.currentPhase !== 'finished' ? 'Yes' : 'No'}</p>
          </div>
        )} */}
      </motion.div>
    </motion.div>
  );
};
