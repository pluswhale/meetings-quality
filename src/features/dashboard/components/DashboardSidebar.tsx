/**
 * DashboardSidebar - Navigation sidebar
 */

import React from 'react';
import { DashboardTab } from '../types';

interface DashboardSidebarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentTab,
  onTabChange,
  onLogout,
}) => {
  return (
    <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 p-8 flex-col justify-between shadow-sm z-10">
      <div>
        <div className="mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 mb-4">
            M
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h2>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => onTabChange(DashboardTab.MEETINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              currentTab === DashboardTab.MEETINGS
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Встречи
          </button>
          <button
            onClick={() => onTabChange(DashboardTab.TASKS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              currentTab === DashboardTab.TASKS
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Задачи
          </button>
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Выйти
      </button>
    </aside>
  );
};
