import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/src/shared/store/auth.store';

/* ── Icons ─────────────────────────────────────────────────────────── */
const Icon = {
  Dashboard: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Projects: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  Meetings: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Plus: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Logout: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const NAV_ITEMS = [
  {
    to: '/dashboard/projects',
    label: 'Проекты',
    icon: <Icon.Projects />,
  },
  {
    to: '/dashboard/meetings',
    label: 'Встречи',
    icon: <Icon.Meetings />,
  },
];

/* ── Sidebar ─────────────────────────────────────────────────────────── */
const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-white/90 backdrop-blur-xl border-r border-mq-border px-4 py-6">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <span className="font-bold text-base text-mq-text tracking-tight">MeetingQuality</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-mq-muted transition-colors lg:hidden"
          >
            <Icon.Close />
          </button>
        )}
      </div>

      {/* New project CTA — meetings are created inside projects, not globally */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          navigate('/project/create');
          onClose?.();
        }}
        className="flex items-center justify-center gap-2 w-full py-2.5 mb-6 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Icon.Plus />
        Новый проект
      </motion.button>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-mq-border mx-1 my-4" />

      {/* User */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-mq-text truncate leading-none">
            {currentUser?.fullName ?? '—'}
          </p>
          <p className="text-[11px] text-mq-muted truncate mt-0.5">{currentUser?.email ?? ''}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Выйти"
          className="flex-shrink-0 p-1.5 rounded-lg text-mq-muted hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
        >
          <Icon.Logout />
        </button>
      </div>
    </aside>
  );
};

/* ── Mobile Bottom Nav ──────────────────────────────────────────────── */
const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-mq-border flex items-center px-2 lg:hidden">
      {NAV_ITEMS.map((item) => {
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

/* ── Mobile Drawer ──────────────────────────────────────────────────── */
const MobileDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden "
        >
          <Sidebar onClose={onClose} />
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-liquid overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
