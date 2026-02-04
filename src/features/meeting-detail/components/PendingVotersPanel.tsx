/**
 * PendingVotersPanel - Shows which participants haven't submitted their vote yet
 * Only visible to meeting creators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

interface PendingVoter {
  _id: string;
  fullName: string;
  email: string;
  isOnline?: boolean;
}

interface PendingVotersPanelProps {
  pendingVoters: PendingVoter[];
  isLoading?: boolean;
  currentPhase: string;
}

export const PendingVotersPanel: React.FC<PendingVotersPanelProps> = ({
  pendingVoters,
  isLoading = false,
  currentPhase,
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-[32px] p-6 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full" />
          <span className="font-bold text-amber-700">Загрузка информации о голосовании...</span>
        </div>
      </motion.div>
    );
  }

  if (!pendingVoters || pendingVoters.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-[32px] p-6 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-green-900 text-lg">Все участники проголосовали! </h3>
            <p className="text-sm font-bold text-green-700 mt-1">
              Можно переходить к следующему этапу
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-[32px] p-6 shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-blue-900 text-lg mb-2">
            Ожидание голосов ({pendingVoters.length})
          </h3>
          <p className="text-sm font-bold text-blue-700 mb-4">
            Следующие участники еще не отправили свой ответ:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {pendingVoters.map((voter, index) => (
              <motion.div
                key={voter._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-blue-100"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">
                      {voter.fullName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  {/* Online indicator */}
                  {voter.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate">{voter.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{voter.email}</p>
                </div>
                {voter.isOnline && (
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-green-200">
                    Онлайн
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
