/**
 * Example: How to use the Sidebar component independently
 * 
 * This file shows different ways to use the Sidebar component
 * in your application.
 */

import React from 'react';
import { Sidebar, SidebarToggleButton, useSidebar } from './Sidebar';

// Example 1: Basic Usage
export const BasicSidebarExample: React.FC = () => {
  const { isOpen, close, toggle } = useSidebar();

  return (
    <div>
      {/* Toggle button in your app header or anywhere */}
      <SidebarToggleButton onClick={toggle} />

      {/* Sidebar component */}
      <Sidebar isOpen={isOpen} onClose={close}>
        <h2 className="text-2xl font-bold mb-4">Menu</h2>
        <nav className="space-y-2">
          <a href="#" className="block px-4 py-2 hover:bg-slate-100 rounded">
            Home
          </a>
          <a href="#" className="block px-4 py-2 hover:bg-slate-100 rounded">
            About
          </a>
          <a href="#" className="block px-4 py-2 hover:bg-slate-100 rounded">
            Contact
          </a>
        </nav>
      </Sidebar>
    </div>
  );
};

// Example 2: Custom styled sidebar with rich content
export const RichSidebarExample: React.FC = () => {
  const { isOpen, close, toggle } = useSidebar();

  return (
    <div>
      <button
        onClick={toggle}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Open Menu
      </button>

      <Sidebar isOpen={isOpen} onClose={close}>
        {/* User Profile Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
            <div>
              <h3 className="font-bold text-lg">John Doe</h3>
              <p className="text-sm text-slate-500">john@example.com</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-6">
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </a>
        </nav>

        {/* Settings at bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <button className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors">
            Settings
          </button>
        </div>
      </Sidebar>
    </div>
  );
};

// Example 3: Programmatic control
export const ProgrammaticSidebarExample: React.FC = () => {
  const sidebar = useSidebar();

  const handleAction = () => {
    // Do some action
    console.log('Action completed');
    // Then open sidebar
    sidebar.open();
  };

  return (
    <div>
      <button onClick={handleAction}>
        Do Action & Open Sidebar
      </button>

      <button onClick={sidebar.close}>
        Close Sidebar
      </button>

      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close}>
        <p>Sidebar opened programmatically!</p>
      </Sidebar>
    </div>
  );
};
