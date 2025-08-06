export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/accounts/register/',
    LOGIN: '/login/',
    FORGOT_PASSWORD: '/password-reset/',
    RESET_PASSWORD: '/password-reset/confirm/',
    REFRESH_TOKEN: '/token/refresh/',
  },
  USER: {
    UPLOAD_PROFILE_PICTURE: '/user/profile-picture/',
    PROFILE_PICTURE_URL: '/user/profile-picture-url/',
  },
  STUDENT: {
    PROFILE: '/accounts/profiles/me/',
    UPDATE_PROFILE: '/accounts/profiles/me/',
  },
  TEACHER: {
    PROFILE: '/accounts/teachers/my-profile/',
    UPDATE_PROFILE: '/accounts/teachers/my-profile/',
  },
};
