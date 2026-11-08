'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import { Logo } from '@/components/astrology/brand/logo';
import { OBS_ANCHORS } from '@/constants/tour-steps';

/** Below lg the navigation lives in the bottom tab bar, so the header only
 *  carries the brand and the profile in view. */
export function DashboardHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="relative z-30 flex min-h-16 shrink-0 items-center gap-3 border-b border-border bg-[var(--cosmos-900)] px-4 py-2 md:gap-6 md:px-6 lg:min-h-20">
      <Link
        href={ROUTES.AGENT.ASTROLOGY.ROOT}
        className="shrink-0"
        aria-label="Shakti Wheel dashboard"
        data-tour={OBS_ANCHORS.brand}
      >
        {/* The mark alone on phones leaves the profile switcher room to breathe. */}
        <span className="sm:hidden">
          <Logo size="sm" isCollapsed />
        </span>
        <span className="hidden sm:block">
          <Logo size="sm" />
        </span>
      </Link>
      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end">
        {children}
      </div>
    </header>
  );
}
