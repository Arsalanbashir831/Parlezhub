'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CalendarDays, Compass, FileText, Hourglass, LayoutDashboard, MessageCircle, Share2, Star, UsersRound } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { OBS_ANCHORS, observatoryNavAnchor } from '@/constants/tour-steps';
import { GuideTourTrigger } from '@/components/guide/guide-tour-provider';
import { useAuth } from '@/contexts/auth-context';
import { astrologerServiceNav, resolveActiveNav } from '@/lib/nav-config';
import type { NavItem } from '@/types/nav';
import { astrologyHref } from '@/lib/astrology-navigation';
import { cn } from '@/lib/utils';

type NavGroup = {
  title: string;
  items: { id?: string; label: string; path: string; icon: NavItem['icon'] }[];
  /** Workspace routes are linked as-is; observatory ones carry the chart params. */
  absolute?: boolean;
  /** Links that own nested screens (/gigs/new, /gigs/12/edit): the active one is
   *  the longest matching href, so a sub-page never lights its parent too. */
  nested?: NavItem[];
  anchor?: string;
};

const mainItems = [
  { label: 'Dashboard', path: ROUTES.AGENT.ASTROLOGY.ROOT, icon: LayoutDashboard },
  { label: 'Chart Analysis', path: ROUTES.AGENT.ASTROLOGY.ANALYSIS, icon: Compass },
  { label: 'Dasha Timeline', path: ROUTES.AGENT.ASTROLOGY.DASHA, icon: Hourglass },
  { label: 'Festival Calendar', path: ROUTES.AGENT.ASTROLOGY.FESTIVAL_CALENDAR, icon: CalendarDays },
  { label: 'AI Vedic Astrologer', path: ROUTES.AGENT.ASTROLOGY.CHAT, icon: MessageCircle },
  { label: 'Generate Vedic Reports', path: ROUTES.AGENT.ASTROLOGY.REPORTS, icon: FileText },
];
const hireItems = [
  { label: 'Find Astrologer', path: ROUTES.AGENT.ASTROLOGY.ASTROLOGERS, icon: Star },
  { label: 'Chat', path: ROUTES.AGENT.ASTROLOGY.HIRE.CHAT, icon: MessageCircle },
  { label: 'Meetings', path: ROUTES.AGENT.ASTROLOGY.HIRE.MEETINGS, icon: CalendarDays },
];
const profileItems = [
  { label: 'Birth Profiles', path: ROUTES.AGENT.ASTROLOGY.PROFILES, icon: UsersRound },
  { label: 'Share Access', path: ROUTES.AGENT.ASTROLOGY.SHARE, icon: Share2 },
];

/** The astrologer's work with students, opened from inside the observatory:
 *  gigs, the student inbox, and the schedule. */
const serviceItems = astrologerServiceNav.map(({ id, label, href, icon }) => ({
  id,
  label,
  path: href as string,
  icon,
}));

export function PrimarySidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeRole, hasStudentRole } = useAuth();
  const isTeacher = activeRole === 'TEACHER';
  const groups: NavGroup[] = [
    { title: 'Explore', items: mainItems },
    ...(isTeacher ? [{ title: 'Astrologer Service', items: serviceItems, absolute: true, nested: astrologerServiceNav, anchor: OBS_ANCHORS.service }] : []),
    ...(hasStudentRole && !isTeacher ? [{ title: 'Hire Astrologer', items: hireItems, absolute: true }] : []),
    { title: 'Profiles and access', items: profileItems },
  ];
  return (
    <nav aria-label="Main navigation" data-tour={OBS_ANCHORS.nav} className="flex h-full flex-col px-4 py-6">
      <div className="mb-6 px-3">
        <p className="obs-label">Your observatory</p>
        <p className="mt-2 text-sm text-muted-foreground">A little perspective, every day.</p>
      </div>
      {groups.map(group => (
        <div key={group.title} data-tour={group.anchor} className="mb-7">
          <p className="obs-label mb-3 px-3">{group.title}</p>
          <ul className="space-y-1">
            {group.items.map(({ id, label, path, icon: Icon }) => {
              const active = group.nested
                ? id === resolveActiveNav(group.nested, pathname)
                : pathname === path || (path === ROUTES.AGENT.ASTROLOGY.ANALYSIS && (pathname.includes('/insights/') || pathname === ROUTES.AGENT.ASTROLOGY.NAVATARA)) || (path === ROUTES.AGENT.ASTROLOGY.PROFILES && pathname === ROUTES.AGENT.ASTROLOGY.PROFILE);
              return (
                <li key={path}>
                  <Link href={group.absolute ? path : astrologyHref(path, searchParams.toString())} onClick={onNavigate} aria-current={active ? 'page' : undefined}
                    data-tour={observatoryNavAnchor(path)}
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
        <GuideTourTrigger anchor={OBS_ANCHORS.guide} onBeforeStart={onNavigate} className="mb-4 w-full">
          <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />
          Guided tour
        </GuideTourTrigger>
        <p className="text-xs leading-relaxed text-muted-foreground">Vedic tradition. Personal reflection.<br />Not medical, financial, or legal advice.</p>
      </div>
    </nav>
  );
}
