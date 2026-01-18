
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Input, Button, Heading, Text, Avatar } from '../components/ui';

export const LoginScreen: React.FC = () => {
  const login = useStore(state => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      navigate('/dashboard');
    } else {
      alert('Пользователь не найден. Попробуйте другой email.');
    }
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
        <form className="space-y-6" onSubmit={handleLogin}>
          <Input
            type="email"
            label="Email"
            placeholder="Введите email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <Input
            type="password"
            label="Пароль"
            placeholder="Введите пароль..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            fullWidth
          >
            Войти
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
  const register = useStore(state => state.register);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email);
    navigate('/dashboard');
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
        <form className="space-y-6" onSubmit={handleRegister}>
          <Input
            type="text"
            label="ФИО"
            placeholder="Введите полное имя..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <Input
            type="email"
            label="Email"
            placeholder="Введите email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <Input
            type="password"
            label="Пароль"
            placeholder="Введите пароль..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            fullWidth
          >
            Создать аккаунт
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
