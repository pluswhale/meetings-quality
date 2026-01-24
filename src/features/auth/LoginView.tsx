/**
 * LoginView - Pure presentation layer for login
 * No business logic, only receives props and renders UI
 */

import React from 'react';
import { Input, Button } from '@/src/shared/ui';
import { AuthLayout } from './components/AuthLayout';
import { useLoginViewModel } from './useLoginViewModel';

export const LoginView: React.FC = () => {
  const vm = useLoginViewModel();

  return (
    <AuthLayout
      title="MeetingQuality"
      subtitle="Вернем эффективность совещаниям"
      error={vm.error}
    >
      <form className="space-y-6" onSubmit={vm.handleSubmit}>
        <Input
          type="email"
          label="Email"
          placeholder="Введите email..."
          value={vm.email}
          onChange={(e) => vm.setEmail(e.target.value)}
          required
          fullWidth
          disabled={vm.isPending}
        />
        <Input
          type="password"
          label="Пароль"
          placeholder="Введите пароль..."
          value={vm.password}
          onChange={(e) => vm.setPassword(e.target.value)}
          required
          fullWidth
          disabled={vm.isPending}
        />
        <Button type="submit" variant="secondary" size="lg" fullWidth disabled={vm.isPending}>
          {vm.isPending ? 'Вход...' : 'Войти'}
        </Button>
      </form>
      <div className="mt-8 text-center">
        <button
          onClick={vm.handleNavigateToRegister}
          className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          Регистрация
        </button>
      </div>
    </AuthLayout>
  );
};
