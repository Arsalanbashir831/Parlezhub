export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
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
