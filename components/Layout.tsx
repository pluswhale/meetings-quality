import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarToggleButton, useSidebar } from './Sidebar';
import { useStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, close, toggle } = useSidebar();
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    close();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">
                Meetings Quality
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Дашборд
              </Link>
              <Link
                to="/meeting/create"
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive('/meeting/create')
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Создать встречу
              </Link>
              {currentUser && (
                <div className="flex items-center ml-4 pl-4 border-l border-slate-200">
                  <span className="text-sm text-slate-600 mr-3">
                    {currentUser.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <SidebarToggleButton onClick={toggle} />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={close}>
        <div className="flex flex-col h-full">
          {/* User Info */}
          {currentUser && (
            <div className="mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{currentUser.fullName}</p>
                  <p className="text-sm text-slate-500">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            <Link
              to="/dashboard"
              onClick={close}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Дашборд</span>
            </Link>

            <Link
              to="/meeting/create"
              onClick={close}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/meeting/create')
                  ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Создать встречу</span>
            </Link>
          </nav>

          {/* Logout Button */}
          <div className="pt-6 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </Sidebar>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};
