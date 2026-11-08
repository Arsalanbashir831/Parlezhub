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
      },
      PROFILES: '/astrology/profiles',
      INSIGHTS: (slug: string) => `/astrology/insights/${slug}`,
    },
  },
  PARLEZHUB: {
    ROOT: '/parlezhub',
  },
};
