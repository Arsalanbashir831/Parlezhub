import { UserRole } from '@/types/user';

// Helper function to get cookies
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

// Helper function to set cookies
export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

// Helper function to remove cookies
export const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const setUserRoles = (roles: UserRole[]) => setCookie('user_roles', JSON.stringify(roles));
export const getUserRoles = (): UserRole[] => {
  const roles = getCookie('user_roles');
  try { return roles ? JSON.parse(roles) : []; } catch { return []; }
};

export const setActiveRole = (role: UserRole) => setCookie('active_role', role);
export const getActiveRole = (): UserRole | null => getCookie('active_role') as UserRole | null;

export const clearAuthCookies = () => {
  removeCookie('user_roles');
  removeCookie('active_role');
};
