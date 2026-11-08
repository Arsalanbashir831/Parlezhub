import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { astrologerServiceNav, resolveActiveNav } from '@/lib/nav-config';

describe('astrologerServiceNav', () => {
  it('lists the astrologer’s work with students, in sidebar order', () => {
    expect(
      astrologerServiceNav.map((item) => [item.label, item.href])
    ).toEqual([
      ['Create Gig', ROUTES.AGENT.ASTROLOGY.SERVICE.CREATE_GIG],
      ['My Gigs', ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS],
      ['Chats', ROUTES.AGENT.ASTROLOGY.SERVICE.CHAT],
      ['Meetings', ROUTES.AGENT.ASTROLOGY.SERVICE.MEETINGS],
    ]);
  });

  it('carries no invented unread counts — the badge comes from the chat list', () => {
    astrologerServiceNav.forEach((item) => {
      expect(item.badge).toBeUndefined();
    });
  });

  it('never offers the astrologer the student-only hiring routes', () => {
    astrologerServiceNav.forEach((item) => {
      expect(item.href?.startsWith(ROUTES.AGENT.ASTROLOGY.HIRE.ROOT)).toBe(
        false
      );
    });
  });
});

describe('resolveActiveNav', () => {
  it('highlights Create Gig on its own route, not the gig list it nests under', () => {
    expect(
      resolveActiveNav(astrologerServiceNav, '/astrology/service/gigs/new')
    ).toBe('create-gig');
  });

  it('falls back to My Gigs for the list and its edit screens', () => {
    expect(
      resolveActiveNav(astrologerServiceNav, '/astrology/service/gigs')
    ).toBe('services');
    expect(
      resolveActiveNav(astrologerServiceNav, '/astrology/service/gigs/12/edit')
    ).toBe('services');
  });

  it('matches each remaining entry to its route', () => {
    expect(
      resolveActiveNav(astrologerServiceNav, '/astrology/service/chat')
    ).toBe('chat');
    expect(
      resolveActiveNav(astrologerServiceNav, '/astrology/service/meetings')
    ).toBe('meetings');
  });

  it('matches whole path segments, not bare prefixes', () => {
    expect(
      resolveActiveNav(astrologerServiceNav, '/astrology/service/chatter')
    ).toBeUndefined();
  });

  it('says nothing for a route the nav does not own', () => {
    expect(resolveActiveNav(astrologerServiceNav, '/astrology')).toBeUndefined();
    expect(
      resolveActiveNav(astrologerServiceNav, '/astrology/dasha')
    ).toBeUndefined();
  });
});
