import { chatSocketBase } from '@/lib/chat-socket-url';

export const API_ROUTES = {
  AUTH: {
    SYNC: '/auth/sync/',
    SET_ROLE: '/auth/set-role/',
    ME: '/accounts/profiles/me/roles/',
    BECOME_TEACHER: '/accounts/become-teacher/',
    BECOME_STUDENT: '/accounts/become-student/',
  },
  STUDENT: {
    UPDATE_PROFILE: '/accounts/profiles/me/',
    GET_ALL_BOOKINGS: '/bookings/bookings/my/',
    REFUND_BOOKING: '/payments/refund/request/',
  },
  TEACHER: {
    UPDATE_PROFILE: '/accounts/teachers/my-profile/',
    CREATE_SERVICE: '/accounts/gigs/',
    GET_YOUR_SERVICES: '/accounts/gigs/',
    GET_SERVICE: (gigId: string) => `/accounts/gigs/${gigId}/`,
    UPDATE_SERVICE: (gigId: string) => `/accounts/gigs/${gigId}/`,
    DELETE_SERVICE: (gigId: string) => `/accounts/gigs/${gigId}/`,
    UPDATE_SERVICE_STATUS: (gigId: string) => `/accounts/gigs/${gigId}/status/`,
    SET_AVAILABILITY: '/bookings/availability/bulk/',
    UPDATE_AVAILABILITY: `/bookings/availability/replace/`,
    APPROVE_BOOKING: (bookingId: string | number) =>
      `/bookings/bookings/${bookingId}/confirm/`,
    GET_ALL_BOOKINGS: '/bookings/bookings/my/',
    CANCEL_BOOKING: (bookingId: string | number) =>
      `/bookings/bookings/${bookingId}/cancel/`,
    RESCHEDULE_BOOKING: (bookingId: string | number) =>
      `/bookings/bookings/${bookingId}/reschedule/`,
    REFUND_BOOKING: '/payments/refund/request/',
    BLOGS: '/blogs/teacher/blogs/',
    BLOG_DETAIL: (blogId: string | number) => `/blogs/teacher/blogs/${blogId}/`,
  },
  USER: {
    UPLOAD_PROFILE_PICTURE: '/user/profile-picture/',
    PROFILE_PICTURE_URL: '/user/profile-picture-url/',
  },
  PUBLIC: {
    GET_ALL_SERVICES: '/accounts/gigs/public/',
    GET_TEACHER_AVAILABILITY: (teacherId: string) =>
      `/bookings/availability/weekly/?teacher_id=${teacherId}`,
    SCHEDULE_BOOKING: '/bookings/bookings/',
  },
  CHAT: {
    // Relative to the /api/chat gateway — the chat server is never called from the browser.
    CREATE_CHAT: '/chats/start/',
    SEND_MESSAGE: (chatId: string) => `/send-message/${chatId}`,
    GET_CHATS: `/accounts/supabase/chats/`,
    // Slashless: Django needs its trailing slash, the FastAPI chat server has
    // none, and a slash here 307s back through the gateway in a loop.
    GET_CHAT_MESSAGES: (chatId: string) => `/messages/${chatId}`,
    MARK_CHAT_READ: (chatId: string) => `/messages/${chatId}/read`,
    CHAT_PRESENCE: (chatId: string) => `/presence/${chatId}`,
    /** Build-time fallback only: the server sends the runtime address with the
     *  socket credential. Null when CHAT_SERVER_URL is not set. */
    WEBSOCKET_URL: chatSocketBase(process.env.CHAT_SERVER_URL),
  },
  VOICE: {
    CONVERSATIONS: '/accounts/voice-conversations/',
    /** The user's conversations of one type: 'language' (AI tutor) or 'astrological'. */
    BY_TYPE: (type: 'language' | 'astrological') =>
      `/accounts/voice-conversations/by-type/${type}/`,
  },
  PAYMENTS: {
    PROCESS_BOOKING_PAYMENT: '/payments/process-booking-payment/',
    GET_PAYMENT_METHODS: '/payments/payment-methods/',
    DELETE_PAYMENT_METHOD: (paymentMethodId: string) => `/payments/payment-methods/${paymentMethodId}/delete/`,
  },
  ASTROLOGY: {
    BIRTH_PROFILE: '/astrology/birth-profile/',
    NATAL_CHART: '/astrology/natal-chart/',
    TRANSITS: '/astrology/transits/',
    NAKSHATRA_PREDICTIONS: '/astrology/nakshatra-predictions/',
    INSIGHTS: '/astrology/insights',
    ACCESS: '/astrology/access/',
    ASTROLOGER_SEARCH: '/accounts/teachers/',
    TEACHER_STUDENTS: '/astrology/teacher/students/',
    GUEST_PROFILES: '/astrology/guest-profiles/',
    GUEST_PROFILE_DETAIL: (id: number) => `/astrology/guest-profiles/${id}/`,
    CHAT: (category: string) => `/astrology/insights/${category}/chat/`,
    DASHA: '/astrology/dasha/',
    FESTIVAL_CALENDAR: '/astrology/festival-calendar/',
    REPORTS: '/astrology/reports/',
    REPORT_PURCHASE: '/astrology/reports/purchase/',
    REPORT_CONFIRM_PAYMENT: '/astrology/reports/confirm-payment/',
    REPORT_DOWNLOAD: (reportType: string) => `/astrology/reports/${reportType}/download/`,
  },
  GEMINI: {
    GENERATE_CONTENT: "/api/gemini/generate-content/",
  }
};
