import type { PublicService } from '@/services/service';
import { describe, expect, it } from 'vitest';

import {
  buildAstrologerProfiles,
  filterAstrologerProfiles,
} from '@/lib/astrologer-directory';

const service = (overrides: Partial<PublicService> = {}): PublicService => ({
  id: 'gig-1',
  teacherId: 'teacher-1',
  consultantName: 'Amina Shah',
  consultantAvatar: null,
  consultantQualification: 'Vedic astrologer',
  consultantExperience: 8,
  consultantBio: 'Career and relationship readings',
  consultantLocation: 'Lahore',
  consultantEmail: '',
  type: 'astrology',
  title: 'Birth chart reading',
  description: '',
  shortDescription: 'Explore your chart',
  price: 75,
  duration: 45,
  tags: ['Birth charts'],
  whatYouProvide: [],
  status: 'active',
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

describe('astrologer directory', () => {
  it('groups active astrology gigs into one profile and keeps every session', () => {
    const profiles = buildAstrologerProfiles([
      service(),
      service({
        id: 'gig-2',
        price: 125,
        title: 'Career reading',
        tags: ['Career', 'Birth charts'],
      }),
      service({
        id: 'gig-3',
        teacherId: 'teacher-2',
        consultantName: 'Noor',
        price: 150,
      }),
      service({ id: 'language', type: 'language', teacherId: 'teacher-3' }),
      service({ id: 'inactive', status: 'inactive', teacherId: 'teacher-4' }),
      service({ id: 'missing-teacher', teacherId: '' }),
      service({
        id: 'invalid-price',
        teacherId: 'teacher-5',
        price: Number.NaN,
      }),
    ]);

    expect(profiles).toHaveLength(2);
    expect(profiles[0]).toMatchObject({
      id: 'teacher-1',
      startingPrice: 75,
      specialties: ['Birth charts', 'Career'],
    });
    expect(profiles[0].services.map((item) => item.id)).toEqual([
      'gig-1',
      'gig-2',
    ]);
    expect(profiles[1].id).toBe('teacher-2');
  });

  it('searches profile and all session details, and matches any session price', () => {
    const profiles = buildAstrologerProfiles([
      service(),
      service({ id: 'gig-2', title: 'Dasha consultation', price: 145 }),
    ]);

    expect(
      filterAstrologerProfiles(profiles, '  DASHA  ', [100, 160])
    ).toHaveLength(1);
    expect(filterAstrologerProfiles(profiles, 'lahore', [0, 80])).toHaveLength(
      1
    );
    expect(filterAstrologerProfiles(profiles, 'dasha', [0, 80])).toHaveLength(
      1
    );
    expect(
      filterAstrologerProfiles(profiles, 'unknown', [0, 200])
    ).toHaveLength(0);
  });
});
