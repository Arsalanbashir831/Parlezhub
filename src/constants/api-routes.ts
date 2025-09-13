export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/accounts/register/',
    LOGIN: '/login/',
    RESEND_VERIFICATION_EMAIL: '/resend-verification/',
    FORGOT_PASSWORD: '/password-reset/',
    RESET_PASSWORD: '/password-reset/confirm/',
    REFRESH_TOKEN: '/token/refresh/',
    GOOGLE_INITIATE: '/auth/google/initiate/',
    GOOGLE_CALLBACK: '/auth/google/callback/',
  },
  STUDENT: {
    PROFILE: '/accounts/profiles/me/',
    UPDATE_PROFILE: '/accounts/profiles/me/',
    GET_ALL_BOOKINGS: '/bookings/bookings/my/',
    REFUND_BOOKING: '/payments/refund/request/',
  },
  TEACHER: {
    PROFILE: '/accounts/teachers/my-profile/',
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
    // Blogs
    BLOGS: '/blogs/teacher/blogs/',
    BLOG_DETAIL: (blogId: string | number) => `/blogs/teacher/blogs/${blogId}/`,
    CREATE_BLOG: '/blogs/teacher/blogs/',
    UPDATE_BLOG: (blogId: string | number) => `/blogs/teacher/blogs/${blogId}/`,
    DELETE_BLOG: (blogId: string | number) => `/blogs/teacher/blogs/${blogId}/`,
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
    CREATE_CHAT: `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chats/start/`,
    GET_CHATS: `/accounts/supabase/chats/`,
    GET_CHAT_MESSAGES: (chatId: string) =>
      `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/messages/${chatId}/`,
    WEBSOCKET_URL: `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL?.replace('http://', 'ws://').replace('https://', 'wss://')}/ws/chat/`,
  },
  VOICE: {
    CONVERSATIONS: '/accounts/voice-conversations/',
  },
  PAYMENTS: {
    PROCESS_BOOKING_PAYMENT: '/payments/process-booking-payment/',
    GET_PAYMENT_METHODS: '/payments/payment-methods/',
  },
};
