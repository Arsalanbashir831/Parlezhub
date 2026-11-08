'use client';

import { ROUTES } from '@/constants/routes';
import { Briefcase, Calendar, MessageCircle, PlusCircle } from 'lucide-react';

import { NavItem } from '@/types/nav';

const hrefMatches = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * The nav id for the current path, chosen by the longest matching href — path
 * segments alone are not enough, because `/astrology/service/gigs/new` is the
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

/** Everything an astrologer does with paying students, from inside the
 *  observatory: publishing a gig, the student inbox, and the schedule. */
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
