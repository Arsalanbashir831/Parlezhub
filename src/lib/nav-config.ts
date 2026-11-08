'use client';

import { ROUTES } from '@/constants/routes';
import {
  Briefcase,
  Calendar,
  Compass,
  FileText,
  History,
  Home,
  Hourglass,
  Languages,
  MessageCircle,
  PlusCircle,
  Settings,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

import { NavItem } from '@/types/nav';

const hrefMatches = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * The nav id for the current path, chosen by the longest matching href — path
 * segments alone are not enough, because `/consultant/services/create` is the
 * Create Gig screen nested under the gig list it belongs to.
 */
export const resolveActiveNav = (
  nav: NavItem[],
  pathname: string
): string | undefined => {
  let match: { id: string; href: string } | undefined;

  const consider = (item: NavItem) => {
    if (!item.href) return;
    if (
      hrefMatches(item.href, pathname) &&
      (!match || item.href.length > match.href.length)
    ) {
      match = { id: item.id, href: item.href };
    }
  };

  nav.forEach((item) => {
    consider(item);
    item.subItems?.forEach(consider);
  });

  return match?.id;
};

/**
 * The workspace sections that earn a tab in the phone tab bar, by nav id, with
 * labels short enough for one. Everything else stays under "More" (the full
 * sidebar sheet). Ids missing from a role's nav are skipped.
 */
export const workspaceMobileTabs: Record<
  'student' | 'consultant',
  { id: string; label: string }[]
> = {
  student: [
    { id: 'dashboard', label: 'Home' },
    { id: 'language', label: 'AI Tutors' },
    { id: 'chat', label: 'Chat' },
    { id: 'meetings', label: 'Meetings' },
  ],
  consultant: [
    { id: 'dashboard', label: 'Home' },
    { id: 'services', label: 'Gigs' },
    { id: 'chat', label: 'Chats' },
    { id: 'meetings', label: 'Meetings' },
  ],
};

export const agentNav: NavItem[] = [
  {
    id: 'language',
    label: 'Language',
    icon: Languages,
    href: ROUTES.AGENT.LANGUAGE,
  },
  // {
  //   id: 'astrology',
  //   label: 'Astrology',
  //   icon: Telescope,
  //   href: ROUTES.AGENT.ASTROLOGY,
  // },
];

export const studentNav: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: ROUTES.AGENT.ASTROLOGY.ROOT,
  },
  {
    id: 'language',
    label: 'AI-Tutors',
    icon: Zap,
    href: ROUTES.AGENT.LANGUAGE,
  },
  {
    id: 'consultants',
    label: 'Find Astrologer',
    icon: Star,
    href: ROUTES.AGENT.ASTROLOGY.ASTROLOGERS,
  },

  // {
  //   id: 'ai-agents',
  //   label: 'AI-Agents',
  //   icon: Zap,
  //   subItems: [
  //     {
  //       id: 'ai-tutor',
  //       label: 'AI Tutor',
  //       icon: Zap,
  //       href: ROUTES.STUDENT.AI_TUTOR,
  //     },
  //     {
  //       id: 'ai-chirologist',
  //       label: 'AI Chirologist',
  //       icon: Hand,
  //       href: ROUTES.STUDENT.AI_CHIROLOGIST,
  //     },
  //   ],
  // },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    href: ROUTES.AGENT.ASTROLOGY.HIRE.CHAT,
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Calendar,
    href: ROUTES.AGENT.ASTROLOGY.HIRE.MEETINGS,
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    href: ROUTES.STUDENT.HISTORY,
  },

  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: ROUTES.STUDENT.SETTINGS,
  },
];

/** Everything an astrologer does with paying students, from inside the
 *  observatory shell. The workspace section of the same name sits at
 *  /consultant; these keep the astrologer in the observatory so publishing a
 *  gig or answering a student never costs a trip out of it. */
export const astrologerServiceNav: NavItem[] = [
  {
    id: 'create-gig',
    label: 'Create Gig',
    icon: PlusCircle,
    href: ROUTES.AGENT.ASTROLOGY.SERVICE.CREATE_GIG,
  },
  {
    id: 'services',
    label: 'My Gigs',
    icon: Briefcase,
    href: ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS,
  },
  {
    id: 'chat',
    label: 'Chats',
    icon: MessageCircle,
    href: ROUTES.AGENT.ASTROLOGY.SERVICE.CHAT,
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Calendar,
    href: ROUTES.AGENT.ASTROLOGY.SERVICE.MEETINGS,
  },
];

export const consultantNav: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: ROUTES.AGENT.ASTROLOGY.ROOT,
  },

  // The same four sections the observatory offers; they open the observatory
  // pages, which are the only home these sections have.
  ...astrologerServiceNav.map((item) => ({
    ...item,
    section: 'Astrologer Service',
  })),

  // The astrologer's own readings. These open the observatory workspace, which
  // brings its own sidebar once one of them is open.
  {
    id: 'obs-chart',
    label: 'My Chart',
    icon: Sparkles,
    href: ROUTES.AGENT.ASTROLOGY.ROOT,
    section: 'My Observatory',
  },
  {
    id: 'obs-analysis',
    label: 'Chart Analysis',
    icon: Compass,
    href: ROUTES.AGENT.ASTROLOGY.ANALYSIS,
    section: 'My Observatory',
  },
  {
    id: 'obs-dasha',
    label: 'Dasha Timeline',
    icon: Hourglass,
    href: ROUTES.AGENT.ASTROLOGY.DASHA,
    section: 'My Observatory',
  },
  {
    id: 'obs-reports',
    label: 'My Reports',
    icon: FileText,
    href: ROUTES.AGENT.ASTROLOGY.REPORTS,
    section: 'My Observatory',
  },

  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: ROUTES.TEACHER.SETTINGS,
    section: 'Account',
  },
];
