'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Menu } from 'lucide-react';

import { Logo } from '@/components/ui/logo';

export function DashboardHeader({
  children,
  onToggleNavigation,
}: {
  children?: React.ReactNode;
  onToggleNavigation: () => void;
}) {
  return (
    <header className="relative z-30 flex min-h-20 shrink-0 items-center gap-3 border-b border-border bg-[var(--cosmos-900)] px-4 md:gap-6 md:px-6">
      <button
        type="button"
        onClick={onToggleNavigation}
        aria-label="Open navigation"
        aria-controls="observatory-navigation"
        className="obs-control h-11 w-11 shrink-0 p-0 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link
        href={ROUTES.AGENT.ASTROLOGY.ROOT}
        className="shrink-0"
        aria-label="Shakti Wheel dashboard"
      >
        <Logo size="sm" />
      </Link>
      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end">
        {children}
      </div>
    </header>
  );
}
