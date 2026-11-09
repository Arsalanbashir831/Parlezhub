import { describe, expect, it } from 'vitest';

import { filterServicesByCategory } from '@/hooks/useServices';
import { buildAstrologerProfiles } from '@/lib/astrologer-directory';
import type { PublicService } from '@/services/service';
import type { Service } from '@/types/service';

/**
 * One consultant account serves both apps, and the gig endpoints return every
 * gig it owns. These guard the rule that each app only ever sees its own kind.
 */

const gig = (id: string, type: Service['type']): Service => ({
  id,
  teacherId: 't-1',
  type,
  title: `${type} gig ${id}`,
  description: '',
  shortDescription: '',
  price: 40,
  duration: 60,
  tags: [],
  whatYouProvide: [],
  status: 'active',
  createdAt: '',
  updatedAt: '',
});

const publicGig = (
  id: string,
  type: PublicService['type'],
  teacherId: string,
  overrides: Partial<PublicService> = {}
): PublicService => ({
  id,
  teacherId,
  consultantName: `Consultant ${teacherId}`,
  consultantAvatar: null,
  consultantQualification: '',
  consultantExperience: 0,
  consultantBio: '',
  consultantLocation: '',
  consultantEmail: '',
  type,
  title: `${type} ${id}`,
  description: '',
  shortDescription: '',
  price: 30,
  duration: 45,
  tags: [],
  whatYouProvide: [],
  status: 'active',
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

describe("a consultant's own gigs", () => {
  const mine = [gig('1', 'astrology'), gig('2', 'language'), gig('3', 'language'), gig('4', 'general')];

  it('ParlezHub sees language gigs only', () => {
    expect(filterServicesByCategory(mine, 'language').map((g) => g.id)).toEqual(['2', '3']);
  });

  it('Shakti Wheel sees astrology gigs only', () => {
    expect(filterServicesByCategory(mine, 'astrology').map((g) => g.id)).toEqual(['1']);
  });

  it('without a category nothing is hidden', () => {
    expect(filterServicesByCategory(mine)).toHaveLength(4);
  });
});

describe('the public consultant directory', () => {
  // t-1 publishes in both apps; t-2 only reads charts; t-3 only teaches.
  const market = [
    publicGig('a', 'astrology', 't-1'),
    publicGig('b', 'language', 't-1', { price: 25 }),
    publicGig('c', 'astrology', 't-2'),
    publicGig('d', 'language', 't-3'),
    publicGig('e', 'language', 't-3', { status: 'inactive' }),
  ];

  it('lists language consultants with their language gigs only', () => {
    const profiles = buildAstrologerProfiles(market, 'language', 'Language consultant');
    expect(profiles.map((p) => p.id).sort()).toEqual(['t-1', 't-3']);
    const both = profiles.find((p) => p.id === 't-1')!;
    expect(both.services.map((s) => s.id)).toEqual(['b']);
    expect(both.startingPrice).toBe(25);
    // Paused gigs never reach the directory.
    expect(profiles.find((p) => p.id === 't-3')!.services.map((s) => s.id)).toEqual(['d']);
  });

  it('keeps the astrology directory to astrology gigs (the default)', () => {
    const profiles = buildAstrologerProfiles(market);
    expect(profiles.map((p) => p.id).sort()).toEqual(['t-1', 't-2']);
    expect(profiles.flatMap((p) => p.services).every((s) => s.type === 'astrology')).toBe(true);
  });
});
