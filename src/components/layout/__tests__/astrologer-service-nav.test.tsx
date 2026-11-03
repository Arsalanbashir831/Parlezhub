// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { consultantNav, resolveActiveNav, studentNav } from '@/lib/nav-config';
import { ROUTES } from '@/constants/routes';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { NavItem } from '@/types/nav';

// The sidebar is a list of links; the router is not part of what is asserted.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  } & Record<string, unknown>) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
}));

// Mutable so a test can ask for the signed-in footer.
const auth = vi.hoisted(() => ({
  isAuthenticated: false,
  activeRole: 'TEACHER',
  hasTeacherRole: true,
  hasStudentRole: false,
  becomeConsultant: () => undefined,
  becomeStudent: () => undefined,
  switchRole: () => undefined,
}));

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => auth,
}));

vi.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: { id: 1, first_name: 'Bhava', last_name: 'Kundu' },
  }),
}));

// The signed-in footer carries the tour trigger; driver.js has nothing to do
// with which links render.
vi.mock('@/components/guide/guide-tour-provider', () => ({
  GuideTourProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  GuideTourTrigger: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

beforeAll(() => {
  // SidebarProvider asks for the mobile breakpoint, and jsdom has no matchMedia.
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as never;
});

// vitest.config.mts disables globals, so Testing Library cannot register its own cleanup hook.
afterEach(() => {
  cleanup();
  auth.isAuthenticated = false;
});

const renderSidebar = (nav: NavItem[], activeTab = 'dashboard') =>
  render(
    <SidebarProvider>
      <AppSidebar
        nav={nav}
        activeTab={activeTab}
        roleLabel="Consultant"
        onLogout={() => undefined}
      />
    </SidebarProvider>
  );

const link = (name: string) => screen.getByRole('link', { name });

describe('consultantNav', () => {
  it('puts the astrologer’s own work under one Astrologer Service section', () => {
    expect(
      consultantNav
        .filter((item) => item.section === 'Astrologer Service')
        .map((item) => item.label)
    ).toEqual([
      'Create Gig',
      'My Gigs',
      'Chats',
      'Meetings',
      'Astro Students',
    ]);
  });

  it('keeps the section contiguous so it renders as a single group', () => {
    const sections = consultantNav.map((item) => item.section);
    const first = sections.indexOf('Astrologer Service');
    const last = sections.lastIndexOf('Astrologer Service');
    expect(last - first).toBe(4);
    expect(sections.slice(first, last + 1)).toEqual(
      Array.from({ length: 5 }, () => 'Astrologer Service')
    );
  });

  it('carries no invented unread counts — the badge comes from the chat list', () => {
    [...consultantNav, ...studentNav].forEach((item) => {
      expect(item.badge).toBeUndefined();
    });
  });

  it('opens the observatory workspace from the consultant sidebar', () => {
    expect(
      consultantNav
        .filter((item) => item.section === 'My Observatory')
        .map((item) => [item.label, item.href])
    ).toEqual([
      ['My Chart', ROUTES.AGENT.ASTROLOGY.ROOT],
      ['Chart Analysis', ROUTES.AGENT.ASTROLOGY.ANALYSIS],
      ['Dasha Timeline', ROUTES.AGENT.ASTROLOGY.DASHA],
      ['My Reports', ROUTES.AGENT.ASTROLOGY.REPORTS],
    ]);
  });

  it('never offers the consultant the student-only hiring routes', () => {
    consultantNav.forEach((item) => {
      expect(item.href?.startsWith(ROUTES.AGENT.ASTROLOGY.HIRE.ROOT)).toBe(
        false
      );
    });
  });
});

describe('resolveActiveNav', () => {
  it('highlights Create Gig on its own route, not the gig list it nests under', () => {
    expect(
      resolveActiveNav(consultantNav, '/consultant/services/create')
    ).toBe('create-gig');
  });

  it('falls back to My Gigs for the list and its edit screens', () => {
    expect(resolveActiveNav(consultantNav, '/consultant/services')).toBe(
      'services'
    );
    expect(
      resolveActiveNav(consultantNav, '/consultant/services/edit/12')
    ).toBe('services');
  });

  it('matches each remaining section entry to its route', () => {
    expect(resolveActiveNav(consultantNav, '/consultant/chat')).toBe('chat');
    expect(resolveActiveNav(consultantNav, '/consultant/meetings')).toBe(
      'meetings'
    );
    expect(
      resolveActiveNav(consultantNav, '/consultant/astrology-students')
    ).toBe('astrology-students');
  });

  it('says nothing for a route the sidebar does not own', () => {
    expect(resolveActiveNav(consultantNav, '/family-tree')).toBeUndefined();
  });

  it('keeps an observatory entry lit while inside the observatory', () => {
    expect(resolveActiveNav(consultantNav, '/astrology')).toBe('obs-chart');
    expect(resolveActiveNav(consultantNav, '/astrology/dasha')).toBe(
      'obs-dasha'
    );
    // A single reading has no entry of its own, so the section stays lit.
    expect(resolveActiveNav(consultantNav, '/astrology/insights/kunda')).toBe(
      'obs-chart'
    );
  });
});

describe('AppSidebar', () => {
  it('renders every section heading and its entries', () => {
    renderSidebar(consultantNav);

    expect(screen.queryByText('Astrologer Service')).not.toBeNull();
    expect(screen.queryByText('Content')).not.toBeNull();
    expect(screen.queryByText('Account')).not.toBeNull();

    [
      'Create Gig',
      'My Gigs',
      'Chats',
      'Meetings',
      'Astro Students',
    ].forEach((label) => {
      expect(link(label)).toBeTruthy();
    });
  });

  it('leaves the leading items unlabelled', () => {
    renderSidebar(consultantNav);
    expect(screen.queryByText('Workspace')).toBeNull();
  });

  it('shows the unseen count on Chats and hides it at zero', () => {
    const { unmount } = renderSidebar(
      consultantNav.map((item) =>
        item.id === 'chat' ? { ...item, badge: 7 } : item
      )
    );
    expect(screen.queryByText('7')).not.toBeNull();
    // The pill is aria-hidden; the count is announced once, in words.
    expect(screen.queryByText('7 unread')).not.toBeNull();
    unmount();

    renderSidebar(
      consultantNav.map((item) =>
        item.id === 'chat' ? { ...item, badge: 0 } : item
      )
    );
    expect(screen.queryByText('0')).toBeNull();
  });

  it('marks only the active entry', () => {
    renderSidebar(consultantNav, 'create-gig');

    expect(link('Create Gig').getAttribute('data-active')).toBe('true');
    expect(link('My Gigs').getAttribute('data-active')).toBe('false');
  });

  it('shows the observatory group and drops the footer door with it', () => {
    auth.isAuthenticated = true;
    renderSidebar(consultantNav);

    expect(screen.queryByText('My Observatory')).not.toBeNull();
    ['My Chart', 'Chart Analysis', 'Dasha Timeline', 'My Reports'].forEach(
      (label) => expect(link(label)).toBeTruthy()
    );
    // The footer used to be the only way in; the section replaces it.
    expect(screen.queryByText('Astrology Dashboard')).toBeNull();
  });

  it('keeps the footer door for a nav that has no observatory section', () => {
    auth.isAuthenticated = true;
    renderSidebar(studentNav, 'dashboard');

    expect(screen.queryByText('Astrology Dashboard')).not.toBeNull();
  });
});
