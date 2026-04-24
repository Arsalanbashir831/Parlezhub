import type React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

import { Logo } from '@/components/ui/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <Link
        href={ROUTES.LANDING_PAGE}
        className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm text-primary-500/60 transition-colors hover:text-primary-500 md:left-8 md:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="relative w-full max-w-lg rounded-2xl border border-primary-500/50 bg-white/5 p-6 shadow-lg">

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
