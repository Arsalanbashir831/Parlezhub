import { describe, expect, it } from 'vitest';

import {
  dashboardFor,
  evaluateRoleGuard,
  landingPathFor,
  rolesNeedRecheck,
  type GuardInput,
} from '@/lib/guard-rules';
import type { UserRole } from '@/types/user';

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
      guard({ isAuthenticated: false, pathname: '/student/chat', search: '?teacherId=9' })
    );

    expect(decision.render).toBe(false);
    expect(decision.redirect).toBe(
      '/auth/sign-in?redirect=' + encodeURIComponent('/student/chat?teacherId=9')
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
      evaluateRoleGuard(guard({ userRoles: ['TEACHER', 'STUDENT', 'BOTH'], activeRole: 'BOTH' }))
    ).toMatchObject({ render: true, redirect: null });
  });

  it('waits instead of bouncing while the roles are unknown', () => {
    // A live session whose role lookup is still pending must not be thrown at
    // sign-in or onboarding — that was the refresh-to-see-the-dashboard bug.
    const decision = evaluateRoleGuard(guard({ userRoles: [], rolesUnknown: true }));

    expect(decision).toEqual({ pending: true, redirect: null, render: false });
  });

  it('sends a resolved roleless account to onboarding', () => {
    const decision = evaluateRoleGuard(guard({ userRoles: [], rolesUnknown: false }));

    expect(decision).toEqual({
      pending: false,
      redirect: '/onboarding/choose-role',
      render: false,
    });
  });

  it('sends a teacher on a student screen to the teacher dashboard', () => {
    const decision = evaluateRoleGuard(
      guard({
        userRoles: ['TEACHER'],
        activeRole: 'TEACHER',
        allowedRoles: ['STUDENT', 'BOTH'],
      })
    );

    expect(decision).toEqual({
      pending: false,
      redirect: '/consultant/dashboard',
      render: false,
    });
  });

  it('honours an explicit fallback path over the dashboard', () => {
    const decision = evaluateRoleGuard(
      guard({ userRoles: ['TEACHER'], activeRole: 'TEACHER', fallbackPath: '/placeholders' })
    );

    expect(decision.redirect).toBe('/placeholders');
  });

  it('falls back to the first held role when no active role is set', () => {
    const decision = evaluateRoleGuard(
      guard({ userRoles: ['TEACHER'], activeRole: null, allowedRoles: ['STUDENT'] })
    );

    expect(decision.redirect).toBe('/consultant/dashboard');
  });

  it('signs the redirect requirement before it looks at roles', () => {
    const decision = evaluateRoleGuard(
      guard({ userRoles: ['STUDENT'], allowedRoles: ['TEACHER'], isAuthenticated: false })
    );

    expect(decision.redirect).toBe(
      '/auth/sign-in?redirect=' + encodeURIComponent('/student/dashboard')
    );
  });});

describe('dashboardFor', () => {
  it('routes only teachers to the consultant home', () => {
    expect(dashboardFor('TEACHER')).toBe('/consultant/dashboard');
    expect(dashboardFor('STUDENT')).toBe('/student/dashboard');
    expect(dashboardFor('BOTH')).toBe('/student/dashboard');
    expect(dashboardFor(null)).toBe('/student/dashboard');
    expect(dashboardFor(undefined)).toBe('/student/dashboard');
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
      rolesNeedRecheck({ isAuthenticated: true, userRoles: [], activeRole: null })
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
      rolesNeedRecheck({ isAuthenticated: false, userRoles: [], activeRole: null })
    ).toBe(false);
  });
});

describe('landingPathFor', () => {
  it('honours the page the user came for', () => {
    expect(
      landingPathFor(
        { isAuthenticated: true, userRoles: ['STUDENT'], activeRole: 'STUDENT' },
        '/student/chat?teacherId=4'
      )
    ).toBe('/student/chat?teacherId=4');
  });

  it('sends a roleless account to onboarding instead of a dashboard', () => {
    expect(
      landingPathFor({ isAuthenticated: true, userRoles: [], activeRole: null })
    ).toBe('/onboarding/choose-role');
  });

  it('lands a teacher on the consultant dashboard', () => {
    expect(
      landingPathFor({ isAuthenticated: true, userRoles: ['TEACHER'], activeRole: 'TEACHER' })
    ).toBe('/consultant/dashboard');
  });

  it('prefers the active role over the first held one', () => {
    expect(
      landingPathFor({
        isAuthenticated: true,
        userRoles: ['TEACHER', 'STUDENT', 'BOTH'],
        activeRole: 'STUDENT',
      })
    ).toBe('/student/dashboard');
  });

  it('falls back to the first held role when none is active', () => {
    expect(
      landingPathFor({ isAuthenticated: true, userRoles: ['TEACHER'], activeRole: null })
    ).toBe('/consultant/dashboard');
  });
});
