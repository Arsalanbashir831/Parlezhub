import { describe, expect, it } from 'vitest';

import {
  APPS,
  APP_IDS,
  DEFAULT_APP,
  appFromPath,
  authRoutes,
  isAppId,
  isAuthPath,
  isOnboardingPath,
} from '@/lib/apps';

describe('appFromPath', () => {
  it('reads the app from its path prefix', () => {
    expect(appFromPath('/astrology')).toBe('astrology');
    expect(appFromPath('/astrology/dasha')).toBe('astrology');
    expect(appFromPath('/parlezhub')).toBe('parlezhub');
    expect(appFromPath('/parlezhub/auth/sign-in')).toBe('parlezhub');
  });

  it('gives the root, shared pages and unknown paths to the default app', () => {
    for (const path of ['/', '/terms', '/privacy', '/nowhere', null, undefined]) {
      expect(appFromPath(path)).toBe(DEFAULT_APP);
    }
  });

  it('matches whole segments, not bare prefixes', () => {
    expect(appFromPath('/parlezhubby')).toBe(DEFAULT_APP);
  });
});

describe('authRoutes', () => {
  it('keeps every auth page of an app under its own prefix', () => {
    for (const id of APP_IDS) {
      const routes = authRoutes(id);
      const base = APPS[id].basePath;
      expect(routes.login).toBe(`${base}/auth/sign-in`);
      expect(routes.callback).toBe(`${base}/auth/callback`);
      expect(routes.onboarding).toBe(`${base}/onboarding`);
      expect(routes.home).toBe(APPS[id].home);
      for (const page of [routes.login, routes.signup, routes.forgotPassword, routes.resetPassword, routes.verifyEmail, routes.authCodeError, routes.callback]) {
        expect(page.startsWith(routes.authBase)).toBe(true);
      }
    }
  });

  it('gives the two apps distinct URLs', () => {
    expect(authRoutes('astrology').login).not.toBe(authRoutes('parlezhub').login);
  });
});

describe('path classification', () => {
  it('treats every app’s auth pages as public auth paths', () => {
    expect(isAuthPath('/astrology/auth/sign-in')).toBe(true);
    expect(isAuthPath('/parlezhub/auth/callback')).toBe(true);
    expect(isAuthPath('/astrology/dasha')).toBe(false);
    expect(isAuthPath('/auth/sign-in')).toBe(false);
  });

  it('recognises every app’s onboarding page', () => {
    expect(isOnboardingPath('/astrology/onboarding')).toBe(true);
    expect(isOnboardingPath('/parlezhub/onboarding')).toBe(true);
    expect(isOnboardingPath('/parlezhub')).toBe(false);
  });

  it('accepts only known app ids', () => {
    expect(isAppId('parlezhub')).toBe(true);
    expect(isAppId('evil')).toBe(false);
    expect(isAppId(undefined)).toBe(false);
  });
});
