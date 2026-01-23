
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Input, Button, Heading, Text } from '../components/ui';
import { useAuthControllerLogin, useAuthControllerRegister } from '@/src/api/generated/auth/auth';

export const LoginScreen: React.FC = () => {
  const setAuth = useStore(state => state.setAuth);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { mutate: login, isPending } = useAuthControllerLogin();

  const handleLogin = (e: React.FormEvent) => {
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

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 md:p-14 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mb-6">
            M
          </div>
          <Heading level="h3" weight="black">
            MeetingQuality
          </Heading>
          <Text variant="body" color="muted" className="mt-2">
            Вернем эффективность совещаниям
          </Text>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <Text variant="small" className="text-red-600">{error}</Text>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <Input
            type="email"
            label="Email"
            placeholder="Введите email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            disabled={isPending}
          />
          <Input
            type="password"
            label="Пароль"
            placeholder="Введите пароль..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            disabled={isPending}
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            fullWidth
            disabled={isPending}
          >
            {isPending ? 'Вход...' : 'Войти'}
          </Button>
        </form>
        <div className="mt-8 text-center">
          <Link to="/register" className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors uppercase tracking-widest">
            Регистрация
          </Link>
        </div>
      </div>
    </div>
  );
};

export const RegisterScreen: React.FC = () => {
  const setAuth = useStore(state => state.setAuth);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { mutate: register, isPending } = useAuthControllerRegister();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    register(
      { data: { fullName: name, email, password } },
      {
        onSuccess: (data) => {
          setAuth(data.user, data.access_token);
          navigate('/dashboard');
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || 'Ошибка регистрации. Попробуйте другой email.';
          setError(message);
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 md:p-14 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mb-6">
            M
          </div>
          <Heading level="h3" weight="black">
            Присоединиться
          </Heading>
          <Text variant="body" color="muted" className="mt-2">
            Начните оценивать качество встреч
          </Text>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <Text variant="small" className="text-red-600">{error}</Text>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleRegister}>
          <Input
            type="text"
            label="ФИО"
            placeholder="Введите полное имя..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            disabled={isPending}
          />
          <Input
            type="email"
            label="Email"
            placeholder="Введите email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            disabled={isPending}
          />
          <Input
            type="password"
            label="Пароль"
            placeholder="Введите пароль (минимум 6 символов)..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            fullWidth
            disabled={isPending}
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            fullWidth
            disabled={isPending}
          >
            {isPending ? 'Создание...' : 'Создать аккаунт'}
          </Button>
        </form>
        <div className="mt-8 text-center">
          <Link to="/login" className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors uppercase tracking-widest">
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>
    </div>
  );
};
