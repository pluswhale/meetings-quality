
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './src/providers/QueryProvider';
import { useStore } from './store';
import { LoginScreen, RegisterScreen } from './screens/AuthScreens';
import { Dashboard } from './screens/Dashboard';
import { MeetingDetail } from './screens/MeetingDetail';
import { CreateMeeting } from './screens/CreateMeeting';
import { TaskDetail } from './screens/TaskDetail';
import { Layout } from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useStore(state => state.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useStore(state => state.currentUser);
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  return <Navigate to={currentUser ? "/dashboard" : "/login"} replace />;
};

const App: React.FC = () => {
  return (
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
  );
};

export default App;
