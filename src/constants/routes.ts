export const ROUTES = {
  LANDING_PAGE: process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://parlezhub.com',
  HOME: '/',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  AUTH: {
    LOGIN: '/auth/sign-in',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CALLBACK: '/auth/callback',
    AUTH_CODE_ERROR: '/auth/auth-code-error',
  },
  AGENT: {
    LANGUAGE: '/language',
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
  ONBOARDING: {
    CHOOSE_ROLE: '/onboarding/choose-role',
  },
  // What remains of the role workspaces: everything else moved into the
  // observatory (/astrology). Old URLs are redirected in proxy.ts.
  STUDENT: {
    HISTORY: '/student/history',
    SETTINGS: '/student/settings',
  },
  TEACHER: {
    SETTINGS: '/consultant/settings',
  },
};
