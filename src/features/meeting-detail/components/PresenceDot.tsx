/**
 * PresenceDot — whether a listed participant is currently connected.
 *
 * The phase forms list everyone who was invited, so this distinguishes "not in
 * the meeting" from "in the list but not online right now".
 */

import React from 'react';

interface PresenceDotProps {
  isOnline: boolean;
}

export const PresenceDot: React.FC<PresenceDotProps> = ({ isOnline }) => (
  <span
    className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`}
    title={isOnline ? 'В сети' : 'Не в сети'}
    aria-label={isOnline ? 'В сети' : 'Не в сети'}
  />
);
