'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CalendarDays, Compass, FileText, Hourglass, LayoutDashboard, MessageCircle, Share2, UsersRound } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { astrologyHref } from '@/lib/astrology-navigation';
import { cn } from '@/lib/utils';

const mainItems = [
  { label: 'Dashboard', path: ROUTES.AGENT.ASTROLOGY.ROOT, icon: LayoutDashboard },
  { label: 'Chart Analysis', path: ROUTES.AGENT.ASTROLOGY.ANALYSIS, icon: Compass },
  { label: 'Dasha Timeline', path: ROUTES.AGENT.ASTROLOGY.DASHA, icon: Hourglass },
  { label: 'Festival Calendar', path: ROUTES.AGENT.ASTROLOGY.FESTIVAL_CALENDAR, icon: CalendarDays },
  { label: 'AI Vedic Astrologer', path: ROUTES.AGENT.ASTROLOGY.CHAT, icon: MessageCircle },
  { label: 'My Reports', path: ROUTES.AGENT.ASTROLOGY.REPORTS, icon: FileText },
];
const profileItems = [
  { label: 'Birth Profiles', path: ROUTES.AGENT.ASTROLOGY.PROFILES, icon: UsersRound },
  { label: 'Share Access', path: ROUTES.AGENT.ASTROLOGY.SHARE, icon: Share2 },
];

export function PrimarySidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <nav aria-label="Main navigation" className="flex h-full flex-col px-4 py-6">
      <div className="mb-6 px-3">
        <p className="obs-label">Your observatory</p>
        <p className="mt-2 text-sm text-muted-foreground">A little perspective, every day.</p>
      </div>
      {[{ title: 'Explore', items: mainItems }, { title: 'Profiles and access', items: profileItems }].map(group => (
        <div key={group.title} className="mb-7">
          <p className="obs-label mb-3 px-3">{group.title}</p>
          <ul className="space-y-1">
            {group.items.map(({ label, path, icon: Icon }) => {
              const active = pathname === path || (path === ROUTES.AGENT.ASTROLOGY.ANALYSIS && (pathname.includes('/insights/') || pathname === ROUTES.AGENT.ASTROLOGY.NAVATARA)) || (path === ROUTES.AGENT.ASTROLOGY.PROFILES && pathname === ROUTES.AGENT.ASTROLOGY.PROFILE);
              return (
                <li key={path}>
                  <Link href={astrologyHref(path, searchParams.toString())} onClick={onNavigate} aria-current={active ? 'page' : undefined}
                    className={cn('flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm transition-colors', active ? 'bg-[var(--solar-orange)]/10 text-[var(--solar-gold)]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}>
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />{label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--solar-orange)]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="mt-auto border-t border-border px-3 pt-5">
        <p className="text-xs leading-relaxed text-muted-foreground">Vedic tradition. Personal reflection.<br />Not medical, financial, or legal advice.</p>
      </div>
    </nav>
  );
}
