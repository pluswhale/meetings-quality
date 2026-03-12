import React from 'react';
import { DashboardTab } from '../types';

interface DashboardSidebarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  userName?: string;
}

const NAV_ITEMS: { tab: DashboardTab; label: string; icon: React.ReactNode }[] = [
  {
    tab: DashboardTab.PROJECTS,
    label: 'Проекты',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
  },
  {
    tab: DashboardTab.MEETINGS,
    label: 'Встречи',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  userName,
}) => {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 p-6 flex-col justify-between">
      {/* Logo */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            M
          </div>
          <span className="text-sm font-semibold text-slate-900">MeetingQuality</span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map(({ tab, label, icon }) => {
            const active = currentTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="space-y-1 pt-4 border-t border-slate-100">
        {userName && (
          <p className="px-3 py-2 text-xs text-slate-400 truncate">{userName}</p>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Выйти
        </button>
      </div>
    </aside>
  );
};
