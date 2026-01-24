import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { Layout } from '../layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const currentUser = useAuthStore(state => state.currentUser);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const currentUser = useAuthStore(state => state.currentUser);
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export const RootRedirect: React.FC = () => {
  const currentUser = useAuthStore(state => state.currentUser);
  return <Navigate to={currentUser ? "/dashboard" : "/login"} replace />;
};
