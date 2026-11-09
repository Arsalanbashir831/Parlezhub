/**
 * Page routes. Auth and onboarding URLs are per app and come from
 * `authRoutes(app)` in src/lib/apps.ts; this file holds the shared pages and
 * each app's own screens.
 */
export const ROUTES = {
  LANDING_PAGE: process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://parlezhub.com',
  HOME: '/',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  AGENT: {
    ASTROLOGY: {
      ROOT: '/astrology',
      NAVATARA: '/astrology/navatara',
      PROFILE: '/astrology/profile',
      SHARE: '/astrology/share',
      DASHA: '/astrology/dasha',
      FESTIVAL_CALENDAR: '/astrology/festival-calendar',
      REPORTS: '/astrology/reports',
      ANALYSIS: '/astrology/analysis',
      CHAT: '/astrology/chat',
      ASTROLOGERS: '/astrology/astrologers',
      HIRE: {
        ROOT: '/astrology/hire',
        CHAT: '/astrology/hire/chat',
        MEETINGS: '/astrology/hire/meetings',
      },
      SERVICE: {
        ROOT: '/astrology/service',
        GIGS: '/astrology/service/gigs',
        CREATE_GIG: '/astrology/service/gigs/new',
        EDIT_GIG: (serviceId: string) => `/astrology/service/gigs/${serviceId}/edit`,
        CHAT: '/astrology/service/chat',
        MEETINGS: '/astrology/service/meetings',
        /** Weekly availability (consultant only). */
        SETTINGS: '/astrology/service/settings',
      },
      PROFILES: '/astrology/profiles',
      INSIGHTS: (slug: string) => `/astrology/insights/${slug}`,
    },
  },
  PARLEZHUB: {
    ROOT: '/parlezhub',
    /** AI language tutor (any role). */
    TUTOR: '/parlezhub/tutor',
    /** Past AI tutor conversations (any role). */
    HISTORY: '/parlezhub/history',
    /** Directory of language consultants (learners). */
    CONSULTANTS: '/parlezhub/consultants',
    /** The consultant's own language gigs. */
    GIGS: '/parlezhub/gigs',
    CREATE_GIG: '/parlezhub/gigs/new',
    EDIT_GIG: (serviceId: string) => `/parlezhub/gigs/${serviceId}/edit`,
    /** The consultant's own blog posts. */
    BLOGS: '/parlezhub/blogs',
    CREATE_BLOG: '/parlezhub/blogs/new',
    EDIT_BLOG: (blogId: string | number) => `/parlezhub/blogs/${blogId}/edit`,
    /** Bookings, for either role. */
    MEETINGS: '/parlezhub/meetings',
    /** Learner ↔ consultant messages, for either role. */
    CHAT: '/parlezhub/chat',
    /** Weekly availability (consultant only). */
    SETTINGS: '/parlezhub/settings',
  },
};
