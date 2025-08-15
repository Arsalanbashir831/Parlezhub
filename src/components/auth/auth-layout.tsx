import type React from 'react';

import { Logo } from '@/components/ui/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <div className="text-center">
          <Logo className="mb-8 mt-4 justify-center" size="lg" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        <div className="glass-effect shadow-soft rounded-2xl p-8">
          {children}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} LinguaFlex. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
