import type React from 'react';

import { Logo } from '@/components/ui/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl border border-primary-500/50 bg-white/5 p-6 shadow-lg">
        <div className="text-center">
          <Logo className="mb-8 mt-4 justify-center" size="lg" />
          <h1 className="mb-2 text-2xl font-bold text-primary-50">{title}</h1>
          {subtitle && <p className="text-primary-50">{subtitle}</p>}
        </div>

        <div className="glass-effect shadow-soft overflow-hidden rounded-2xl p-8">
          {children}
        </div>

        <div className="text-center">
          <p className="text-sm text-primary-500/60">
            © {new Date().getFullYear()} ParlezHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
