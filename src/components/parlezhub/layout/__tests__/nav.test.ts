import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';

import { isLinkActive, isNavGroup, navFor, type NavEntry, type NavLink } from '../nav';

const P = ROUTES.PARLEZHUB;

const labels = (entries: NavEntry[]) =>
  entries.map((entry) =>
    isNavGroup(entry) ? `${entry.label}: ${entry.children.map((c) => c.label).join(', ')}` : entry.label
  );

const links = (entries: NavEntry[]): NavLink[] =>
  entries.flatMap((entry) => (isNavGroup(entry) ? entry.children : [entry]));

describe('ParlezHub navigation', () => {
  it('gives a learner the directory of consultants', () => {
    expect(labels(navFor(false))).toEqual([
      'Dashboard',
      'AI Language Tutor',
      'Language Consultants',
      'Meetings',
      'Chat',
      'History',
    ]);
  });

  it('gives a consultant the same spine, with gigs and Settings', () => {
    expect(labels(navFor(true))).toEqual([
      'Dashboard',
      'AI Language Tutor',
      'Language Consultant: Create Gig, My Gigs',
      'Meetings',
      'Chat',
      'History',
      'Settings',
    ]);
  });

  it.each([
    [P.ROOT, 'Dashboard'],
    [P.TUTOR, 'AI Language Tutor'],
    [P.CREATE_GIG, 'Create Gig'],
    [P.GIGS, 'My Gigs'],
    [P.EDIT_GIG('7'), 'My Gigs'],
    [`${P.CHAT}`, 'Chat'],
  ])('marks exactly one link current on %s', (pathname, expected) => {
    const active = links(navFor(true)).filter((link) => isLinkActive(link, pathname));
    expect(active.map((link) => link.label)).toEqual([expected]);
  });
});
