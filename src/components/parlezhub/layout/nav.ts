import {
  Briefcase,
  CalendarDays,
  FileText,
  History,
  LayoutDashboard,
  LayoutList,
  MessageCircle,
  Mic,
  Newspaper,
  PenSquare,
  PlusCircle,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';

/**
 * The ParlezHub sidebar, per profile. Both profiles share the same spine, in
 * the same order, so switching never moves things around; only the "Language
 * Consultant" entry differs: a learner browses consultants, a consultant
 * manages their own gigs.
 */

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Whether the link is the current page. Defaults to a prefix match. */
  isActive?: (pathname: string) => boolean;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry;

const P = ROUTES.PARLEZHUB;

const under = (base: string) => (pathname: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

const DASHBOARD: NavLink = {
  label: 'Dashboard',
  href: P.ROOT,
  icon: LayoutDashboard,
  isActive: (pathname) => pathname === P.ROOT,
};
const TUTOR: NavLink = { label: 'AI Language Tutor', href: P.TUTOR, icon: Mic };
const MEETINGS: NavLink = { label: 'Meetings', href: P.MEETINGS, icon: CalendarDays };
const CHAT: NavLink = { label: 'Chat', href: P.CHAT, icon: MessageCircle };
const HISTORY: NavLink = { label: 'History', href: P.HISTORY, icon: History };

export const LEARNER_NAV: NavEntry[] = [
  DASHBOARD,
  TUTOR,
  { label: 'Language Consultants', href: P.CONSULTANTS, icon: Users },
  MEETINGS,
  CHAT,
  HISTORY,
];

export const CONSULTANT_NAV: NavEntry[] = [
  DASHBOARD,
  TUTOR,
  {
    label: 'Language Consultant',
    icon: Briefcase,
    children: [
      {
        label: 'Create Gig',
        href: P.CREATE_GIG,
        icon: PlusCircle,
        isActive: (pathname) => pathname === P.CREATE_GIG,
      },
      {
        label: 'My Gigs',
        href: P.GIGS,
        icon: LayoutList,
        // Editing a gig is part of My Gigs; creating one is its own entry.
        isActive: (pathname) => under(P.GIGS)(pathname) && pathname !== P.CREATE_GIG,
      },
    ],
  },
  {
    label: 'Blog',
    icon: Newspaper,
    children: [
      {
        label: 'Write Post',
        href: P.CREATE_BLOG,
        icon: PenSquare,
        isActive: (pathname) => pathname === P.CREATE_BLOG,
      },
      {
        label: 'My Posts',
        href: P.BLOGS,
        icon: FileText,
        // Editing a post is part of My Posts; writing one is its own entry.
        isActive: (pathname) => under(P.BLOGS)(pathname) && pathname !== P.CREATE_BLOG,
      },
    ],
  },
  MEETINGS,
  CHAT,
  HISTORY,
  // Consultants only: the hours learners can book them.
  { label: 'Settings', href: P.SETTINGS, icon: Settings },
];

export function navFor(isConsultant: boolean): NavEntry[] {
  return isConsultant ? CONSULTANT_NAV : LEARNER_NAV;
}

export function isLinkActive(link: NavLink, pathname: string): boolean {
  return (link.isActive ?? under(link.href))(pathname);
}
