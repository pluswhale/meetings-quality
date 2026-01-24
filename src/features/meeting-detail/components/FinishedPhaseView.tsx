/**
 * FinishedPhaseView - Statistics view for completed meetings
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/src/shared/lib';

interface FinishedPhaseViewProps {
  meeting: any;
  statistics: any;
  onBack: () => void;
}

export const FinishedPhaseView: React.FC<FinishedPhaseViewProps> = ({
  meeting,
  statistics,
  onBack,
}) => {
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
        onClick={onBack}
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
            {formatDate(meeting.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })}
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
          <h3 className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-6">
            Участников
          </h3>
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
        {statistics.participantStats.map((stat: any, index: number) => (
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
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                  {stat.participant.email}
                </p>
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
};
