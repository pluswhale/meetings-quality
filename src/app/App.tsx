import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import '@/src/shared/styles/slider-custom.css';
import { QueryProvider } from './providers/QueryProvider';
import { ProtectedRoute, AuthRoute, RootRedirect } from './routing/guards';
import { AppLayout } from './layout/AppLayout';

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
        <Toaster position="top-right" />

        <Routes>
          {/* Auth */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginScreen />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterScreen />
              </AuthRoute>
            }
          />

          {/* Meeting (fullscreen) */}
          <Route
            path="/meeting/:id"
            element={
              <ProtectedRoute>
                <MeetingDetail />
              </ProtectedRoute>
            }
          />

          {/* Meeting create */}
          <Route
            path="/meeting/create"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CreateMeeting />} />
          </Route>

          {/* Main App Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* default redirect */}
            <Route index element={<Navigate to="projects" replace />} />

            {/* tabs */}
            <Route path="projects" element={<Dashboard />} />
            <Route path="meetings" element={<Dashboard />} />
          </Route>

          {/* projects */}
          <Route path="project/create" element={<CreateProjectView />} />
          <Route path="project/:id" element={<ProjectDetailView />} />

          {/* tasks */}
          <Route path="task/create" element={<CreateTaskView />} />
          <Route path="task/:id" element={<TaskDetail />} />

          {/* root */}
          <Route path="/" element={<RootRedirect />} />

          {/* 404 */}
          <Route
            path="*"
            element={<div className="p-20 text-center text-sm">404 — Страница не найдена</div>}
          />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;
