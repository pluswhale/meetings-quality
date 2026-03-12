import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import '@/src/shared/styles/slider-custom.css';
import { QueryProvider } from './providers/QueryProvider';
import { ProtectedRoute, AuthRoute, RootRedirect } from './routing/guards';
import { LoginScreen, RegisterScreen } from '@/src/features/auth';
import { Dashboard } from '@/src/features/dashboard';
import { MeetingDetail } from '@/src/features/meeting-detail';
import { CreateMeeting } from '@/src/features/create-meeting';
import { TaskDetail } from '@/src/features/task-detail';
import { ProjectDetailView, CreateProjectView } from '@/src/features/projects';
import { CreateTaskView } from '@/src/features/create-task';

const App: React.FC = () => {
  return (
    <QueryProvider>
      <BrowserRouter basename="/meetings-quality">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#f8fafc', borderRadius: '12px' },
            success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { duration: 5000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-700">
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<AuthRoute><LoginScreen /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterScreen /></AuthRoute>} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Projects */}
            <Route path="/projects" element={<Navigate to="/dashboard?tab=PROJECTS" replace />} />
            <Route path="/project/create" element={<ProtectedRoute><CreateProjectView /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectDetailView /></ProtectedRoute>} />

            {/* Meetings */}
            <Route path="/meeting/create" element={<ProtectedRoute><CreateMeeting /></ProtectedRoute>} />
            <Route path="/meeting/:id" element={<ProtectedRoute><MeetingDetail /></ProtectedRoute>} />

            {/* Tasks */}
            <Route path="/task/create" element={<ProtectedRoute><CreateTaskView /></ProtectedRoute>} />
            <Route path="/task/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />

            {/* Fallbacks */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<div className="p-20 text-center text-sm font-medium text-slate-400">404 — Страница не найдена</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;
