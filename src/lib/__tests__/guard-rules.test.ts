import { describe, expect, it } from 'vitest';

import type { UserRole } from '@/types/user';
import {
  dashboardFor,
  evaluateRoleGuard,
  HOME_PATH,
  landingPathFor,
  rolesNeedRecheck,
  type GuardInput,
} from '@/lib/guard-rules';

function guard(overrides: Partial<GuardInput> = {}): GuardInput {
  const userRoles: UserRole[] = overrides.userRoles ?? [];
  return {
    isLoading: false,
    isAuthenticated: true,
    userRoles,
    activeRole: null,
    allowedRoles: ['STUDENT', 'BOTH'],
    canAccessRole: (role) => userRoles.includes(role),
    pathname: '/student/dashboard',
    search: '',
    ...overrides,
  };
}

describe('evaluateRoleGuard', () => {
  it('holds still while the session is being resolved', () => {
    expect(evaluateRoleGuard(guard({ isLoading: true }))).toEqual({
      pending: true,
      redirect: null,
      render: false,
    });
  });

  it('sends an anonymous visitor to sign-in with the intended path preserved', () => {
    const decision = evaluateRoleGuard(
      guard({
        isAuthenticated: false,
        pathname: '/student/chat',
        search: '?teacherId=9',
      })
    );

    expect(decision.render).toBe(false);
    expect(decision.redirect).toBe(
      '/astrology/auth/sign-in?redirect=' +
        encodeURIComponent('/student/chat?teacherId=9')
    );
  });

  it('renders for a role the account actually holds', () => {
    expect(evaluateRoleGuard(guard({ userRoles: ['STUDENT'] }))).toEqual({
      pending: false,
      redirect: null,
      render: true,
    });
  });

  it('renders for BOTH when only students are allowed', () => {
    expect(
      evaluateRoleGuard(
        guard({ userRoles: ['TEACHER', 'STUDENT', 'BOTH'], activeRole: 'BOTH' })
      )
    ).toMatchObject({ render: true, redirect: null });
  });

  it('waits instead of bouncing while the roles are unknown', () => {
    // A live session whose role lookup is still pending must not be thrown at
    // sign-in or onboarding — that was the refresh-to-see-the-dashboard bug.
    const decision = evaluateRoleGuard(
      guard({ userRoles: [], rolesUnknown: true })
    );

    expect(decision).toEqual({ pending: true, redirect: null, render: false });
  });

  it('sends a resolved roleless account to onboarding', () => {
    const decision = evaluateRoleGuard(
      guard({ userRoles: [], rolesUnknown: false })
    );

    expect(decision).toEqual({
      pending: false,
      redirect: '/astrology/onboarding',
      render: false,
    });
  });

  it('sends a teacher on a student screen to the astrology workspace', () => {
    const decision = evaluateRoleGuard(
      guard({
        userRoles: ['TEACHER'],
        activeRole: 'TEACHER',
        allowedRoles: ['STUDENT', 'BOTH'],
      })
    );

    expect(decision).toEqual({
      pending: false,
      redirect: '/astrology',
      render: false,
    });
  });

  it('honours an explicit fallback path over the dashboard', () => {
    const decision = evaluateRoleGuard(
      guard({
        userRoles: ['TEACHER'],
        activeRole: 'TEACHER',
        fallbackPath: '/placeholders',
      })
    );

    expect(decision.redirect).toBe('/placeholders');
  });

  it('falls back to the first held role when no active role is set', () => {
    const decision = evaluateRoleGuard(
      guard({
        userRoles: ['TEACHER'],
        activeRole: null,
        allowedRoles: ['STUDENT'],
      })
    );

    expect(decision.redirect).toBe('/astrology');
  });

  it('signs the redirect requirement before it looks at roles', () => {
    const decision = evaluateRoleGuard(
      guard({
        userRoles: ['STUDENT'],
        allowedRoles: ['TEACHER'],
        isAuthenticated: false,
      })
    );

    expect(decision.redirect).toBe(
      '/astrology/auth/sign-in?redirect=' + encodeURIComponent('/student/dashboard')
    );
  });
});

describe('dashboardFor', () => {
  it('routes every role to the shared astrology workspace', () => {
    expect(dashboardFor('TEACHER')).toBe('/astrology');
    expect(dashboardFor('STUDENT')).toBe('/astrology');
    expect(dashboardFor('BOTH')).toBe('/astrology');
    expect(dashboardFor(null)).toBe('/astrology');
    expect(dashboardFor(undefined)).toBe('/astrology');
  });
});

describe('rolesNeedRecheck', () => {
  it('waits for a role lookup that failed rather than one that came back empty', () => {
    expect(
      rolesNeedRecheck({
        isAuthenticated: true,
        userRoles: [],
        activeRole: null,
        rolesUnknown: true,
      })
    ).toBe(true);
  });

  it('re-checks an empty answer, which can lag the backend profile row', () => {
    expect(
      rolesNeedRecheck({
        isAuthenticated: true,
        userRoles: [],
        activeRole: null,
      })
    ).toBe(true);
  });

  it('stops once Django asks for a role to be chosen', () => {
    expect(
      rolesNeedRecheck({
        isAuthenticated: true,
        userRoles: [],
        activeRole: null,
        requiresRoleSelection: true,
      })
    ).toBe(false);
  });

  it('is settled by any resolved role', () => {
    expect(
      rolesNeedRecheck({
        isAuthenticated: true,
        userRoles: ['TEACHER', 'STUDENT', 'BOTH'],
        activeRole: 'BOTH',
      })
    ).toBe(false);
  });

  it('says nothing for an anonymous snapshot', () => {
    expect(
      rolesNeedRecheck({
        isAuthenticated: false,
        userRoles: [],
        activeRole: null,
      })
    ).toBe(false);
  });
});

describe('landingPathFor', () => {
  it('always lands authenticated users in the shared workspace', () => {
    expect(
      landingPathFor(
        {
          isAuthenticated: true,
          userRoles: ['STUDENT'],
          activeRole: 'STUDENT',
        },
        '/student/chat?teacherId=4'
      )
    ).toBe('/astrology');
  });

  it('sends a roleless account to onboarding instead of a dashboard', () => {
    expect(
      landingPathFor({ isAuthenticated: true, userRoles: [], activeRole: null })
    ).toBe('/astrology/onboarding');
  });

  it('lands a teacher on the astrology workspace', () => {
    expect(
      landingPathFor({
        isAuthenticated: true,
        userRoles: ['TEACHER'],
        activeRole: 'TEACHER',
      })
    ).toBe('/astrology');
  });

  it('lands a student on the same home as a teacher', () => {
    expect(
      landingPathFor({
        isAuthenticated: true,
        userRoles: ['STUDENT'],
        activeRole: 'STUDENT',
      })
    ).toBe(HOME_PATH);
  });

  it('does not branch on the active role', () => {
    expect(
      landingPathFor({
        isAuthenticated: true,
        userRoles: ['TEACHER', 'STUDENT', 'BOTH'],
        activeRole: 'STUDENT',
      })
    ).toBe(HOME_PATH);
  });

  it('keeps the astrology workspace as home when no role is active', () => {
    expect(
      landingPathFor({
        isAuthenticated: true,
        userRoles: ['TEACHER'],
        activeRole: null,
      })
    ).toBe(HOME_PATH);
  });
});

describe('per-app routing', () => {
  it('sends a signed-out visitor to the sign-in of the app they were in', () => {
    const decision = evaluateRoleGuard(
      guard({ isAuthenticated: false, pathname: '/parlezhub', search: '?tab=1' })
    );
    expect(decision.redirect).toBe(
      `/parlezhub/auth/sign-in?redirect=${encodeURIComponent('/parlezhub?tab=1')}`
    );
  });

  it('sends a roleless account to that app’s onboarding', () => {
    const decision = evaluateRoleGuard(
      guard({ pathname: '/parlezhub', userRoles: [], rolesUnknown: false })
    );
    expect(decision.redirect).toBe('/parlezhub/onboarding');
  });

  it('lands a fresh session on the home of the app it signed in to', () => {
    const roled = { isAuthenticated: true, userRoles: ['STUDENT' as const], activeRole: 'STUDENT' as const };
    expect(landingPathFor(roled, null, 'parlezhub')).toBe('/parlezhub');
    expect(landingPathFor({ ...roled, userRoles: [], activeRole: null }, null, 'parlezhub')).toBe(
      '/parlezhub/onboarding'
    );
    expect(landingPathFor(roled)).toBe(HOME_PATH);
  });

  it('defaults to the astrology app for the home of a role', () => {
    expect(dashboardFor('TEACHER')).toBe('/astrology');
    expect(dashboardFor('TEACHER', 'parlezhub')).toBe('/parlezhub');
  });
});
