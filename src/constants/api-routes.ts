export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/accounts/register/',
    LOGIN: '/login/',
    FORGOT_PASSWORD: '/password-reset/',
    RESET_PASSWORD: '/password-reset/confirm/',
    REFRESH_TOKEN: '/token/refresh/',
  },
  STUDENT: {
    PROFILE: '/accounts/profiles/me/',
    UPDATE_PROFILE: '/accounts/profiles/me/',
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
  },
  USER: {
    UPLOAD_PROFILE_PICTURE: '/user/profile-picture/',
    PROFILE_PICTURE_URL: '/user/profile-picture-url/',
  },
  PUBLIC: {
    GET_ALL_SERVICES: '/accounts/gigs/public/',
  },
};
