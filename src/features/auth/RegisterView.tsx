/**
 * RegisterView - Pure presentation layer for registration
 * No business logic, only receives props and renders UI
 */

import React from 'react';
import { Input, Button } from '@/src/shared/ui';
import { AuthLayout } from './components/AuthLayout';
import { useRegisterViewModel } from './useRegisterViewModel';

export const RegisterView: React.FC = () => {
  const vm = useRegisterViewModel();

  return (
    <AuthLayout
      title="Присоединиться"
      subtitle="Начните оценивать качество встреч"
      error={vm.error}
    >
      <form className="space-y-6" onSubmit={vm.handleSubmit}>
        <Input
          type="text"
          label="ФИО"
          placeholder="Введите полное имя..."
          value={vm.fullName}
          onChange={(e) => vm.setFullName(e.target.value)}
          required
          fullWidth
          disabled={vm.isPending}
        />
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
          placeholder="Введите пароль (минимум 6 символов)..."
          value={vm.password}
          onChange={(e) => vm.setPassword(e.target.value)}
          required
          minLength={6}
          fullWidth
          disabled={vm.isPending}
        />
        <Button type="submit" variant="secondary" size="lg" fullWidth disabled={vm.isPending}>
          {vm.isPending ? 'Создание...' : 'Создать аккаунт'}
        </Button>
      </form>
      <div className="mt-8 text-center">
        <button
          onClick={vm.handleNavigateToLogin}
          className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </AuthLayout>
  );
};
