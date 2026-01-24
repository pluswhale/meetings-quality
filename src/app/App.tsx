import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { ProtectedRoute, AuthRoute, RootRedirect } from './routing/guards';
import { LoginScreen, RegisterScreen } from '@/src/features/auth';
import { Dashboard } from '@/src/features/dashboard';
import { MeetingDetail } from '@/src/features/meeting-detail';
import { CreateMeeting } from '@/src/features/create-meeting';
import { TaskDetail } from '@/src/features/task-detail';

const App: React.FC = () => {
  return (
    <QueryProvider>
      <BrowserRouter basename="/meetings-quality">
        <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-700">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<AuthRoute><LoginScreen /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterScreen /></AuthRoute>} />

            {/* Protected Main Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/meeting/create" element={<ProtectedRoute><CreateMeeting /></ProtectedRoute>} />
            <Route path="/meeting/:id" element={<ProtectedRoute><MeetingDetail /></ProtectedRoute>} />
            <Route path="/task/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />

            {/* Fallbacks */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<div className="p-20 text-center font-black text-slate-400">404 — Страница не найдена</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;
