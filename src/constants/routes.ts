export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/sign-in',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  AGENT: {
    LANGUAGE: '/language',
    ASTROLOGY: '/astrology',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    TEACHERS: '/student/teachers',
    AI_TUTOR: '/student/ai-tutor',
    AI_CHIROLOGIST: '/student/ai-chirologist',
    CHAT: '/student/chat',
    MEETINGS: '/student/meetings',
    HISTORY: '/student/history',
    SESSION_REPORT: '/student/session-report',
    SETTINGS: '/student/settings',
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    CHAT: '/teacher/chat',
    MEETINGS: '/teacher/meetings',
    SERVICES: '/teacher/services',
    CREATE_SERVICE: '/teacher/services/create',
    EDIT_SERVICE: '/teacher/services/edit',
    SETTINGS: '/teacher/settings',
  },
  AI_SESSION: {
    ROOT: '/ai-session',
    START: '/ai-session/start',
    SETUP: '/ai-session/setup',
  },
};
