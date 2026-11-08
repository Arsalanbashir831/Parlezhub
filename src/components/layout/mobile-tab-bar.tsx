'use client';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

import type { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';

export interface MobileTab {
  id: string;
  label: string;
  href: string;
  icon: NavItem['icon'];
  active: boolean;
  badge?: number | string;
}

/** The workspace shell and the observatory carry different palettes; the bar
 *  takes on whichever one it sits in. */
const TONES = {
  workspace: {
    bar: 'border-white/5 bg-background',
    idle: 'text-primary-100/55 hover:text-primary-100',
    active: 'text-primary-300',
    pill: 'bg-primary-500/15',
    badge: 'bg-primary-500 text-primary-950 ring-background',
  },
  observatory: {
    bar: 'border-border bg-[var(--cosmos-900)]',
    idle: 'text-muted-foreground hover:text-foreground',
    active: 'text-[var(--solar-gold)]',
    pill: 'bg-[color-mix(in_srgb,var(--solar-orange)_14%,transparent)]',
    badge:
      'bg-[var(--solar-orange)] text-[var(--cosmos-950)] ring-[var(--cosmos-900)]',
  },
} as const;

const ITEM =
  'flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium leading-none transition-colors [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current';

const badgeLabel = (badge: number | string) =>
  typeof badge === 'number' && badge > 99 ? '99+' : badge;

function TabGlyph({
  icon: Icon,
  active,
  pill,
  badge,
  badgeClass,
}: {
  icon: NavItem['icon'];
  active: boolean;
  pill: string;
  badge?: number | string;
  badgeClass: string;
}) {
  const hasBadge = badge !== undefined && badge !== 0 && badge !== '';
  return (
    <span
      className={cn(
        'relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200',
        active && pill
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {hasBadge && (
        <span
          className={cn(
            'absolute right-2 top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums ring-2',
            badgeClass
          )}
          aria-hidden="true"
        >
          {badgeLabel(badge)}
        </span>
      )}
    </span>
  );
}

/**
 * Thumb-reach navigation for phones and small tablets: the most used sections
 * as tabs, everything else one tap away behind "More" (the shell's full menu).
 * Placement — fixed or in the shell's flex column — is the caller's choice.
 */
export function MobileTabBar({
  tabs,
  onMore,
  moreActive,
  moreExpanded,
  tone,
  className,
}: {
  tabs: MobileTab[];
  onMore: () => void;
  /** The current page is not one of the tabs, so "More" holds it. */
  moreActive: boolean;
  moreExpanded: boolean;
  tone: keyof typeof TONES;
  className?: string;
}) {
  const t = TONES[tone];

  return (
    <nav
      aria-label="Quick navigation"
      className={cn(
        'border-t pb-[env(safe-area-inset-bottom)]',
        t.bar,
        className
      )}
    >
      <ul className="mx-auto grid max-w-lg auto-cols-fr grid-flow-col">
        {tabs.map((tab) => (
          <li key={tab.id} className="min-w-0">
            <Link
              href={tab.href}
              aria-current={tab.active ? 'page' : undefined}
              className={cn(ITEM, tab.active ? t.active : t.idle)}
            >
              <TabGlyph
                icon={tab.icon}
                active={tab.active}
                pill={t.pill}
                badge={tab.badge}
                badgeClass={t.badge}
              />
              <span className="max-w-full truncate px-1">{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="sr-only">, {tab.badge} unread</span>
              )}
            </Link>
          </li>
        ))}
        <li className="min-w-0">
          <button
            type="button"
            onClick={onMore}
            aria-haspopup="dialog"
            aria-expanded={moreExpanded}
            className={cn(ITEM, moreActive ? t.active : t.idle)}
          >
            <TabGlyph
              icon={MoreHorizontal}
              active={moreActive}
              pill={t.pill}
              badgeClass={t.badge}
            />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
