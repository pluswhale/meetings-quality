/**
 * ViewModel for Login
 * Contains all business logic for authentication
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { useAuthControllerLogin } from '@/src/shared/api/generated/auth/auth';
import { LoginViewModel } from './types';

export const useLoginViewModel = (): LoginViewModel => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // API mutation
  const { mutate: login, isPending } = useAuthControllerLogin();

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    login(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          setAuth(data.user, data.access_token);
          navigate('/dashboard');
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || 'Неверный email или пароль';
          setError(message);
        },
      }
    );
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isPending,
    handleSubmit,
    handleNavigateToRegister,
  };
};
