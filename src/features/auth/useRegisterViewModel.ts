/**
 * ViewModel for Register
 * Contains all business logic for user registration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { useAuthControllerRegister } from '@/src/shared/api/generated/auth/auth';
import { RegisterViewModel } from './types';

export const useRegisterViewModel = (): RegisterViewModel => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // API mutation
  const { mutate: register, isPending } = useAuthControllerRegister();

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    register(
      { data: { fullName, email, password } },
      {
        onSuccess: (data) => {
          setAuth(data.user, data.access_token);
          navigate('/dashboard');
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message || 'Ошибка регистрации. Попробуйте другой email.';
          setError(message);
        },
      }
    );
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isPending,
    handleSubmit,
    handleNavigateToLogin,
  };
};
