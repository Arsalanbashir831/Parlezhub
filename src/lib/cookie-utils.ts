// Helper function to get cookies
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to set cookies
export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Helper function to remove cookies
export const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Helper function to set user roles (array of roles)
export const setUserRoles = (roles: ('STUDENT' | 'TEACHER' | 'BOTH')[]) => {
  setCookie('user_roles', JSON.stringify(roles));
};

// Helper function to get user roles
export const getUserRoles = (): ('STUDENT' | 'TEACHER' | 'BOTH')[] => {
  const rolesStr = getCookie('user_roles');
  if (!rolesStr) return [];
  try {
    return JSON.parse(rolesStr);
  } catch {
    return [];
  }
};

// Helper function to set active role
export const setActiveRole = (role: 'STUDENT' | 'TEACHER' | 'BOTH') => {
  setCookie('active_role', role);
};

// Helper function to get active role
export const getActiveRole = (): 'STUDENT' | 'TEACHER' | 'BOTH' | null => {
  return getCookie('active_role') as 'STUDENT' | 'TEACHER' | 'BOTH' | null;
};

export const clearAuthCookies = () => {
  removeCookie('user_roles');
  removeCookie('active_role');
};
