/**
 * AuthLayout - Shared layout for auth screens
 * Pure presentation component
 */

import React from 'react';
import { Heading, Text } from '@/src/shared/ui';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  error?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, error, children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 md:p-14 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mb-6">
            M
          </div>
          <Heading level="h3" weight="black">
            {title}
          </Heading>
          <Text variant="body" color="muted" className="mt-2">
            {subtitle}
          </Text>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <Text variant="small" className="text-red-600">
              {error}
            </Text>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
