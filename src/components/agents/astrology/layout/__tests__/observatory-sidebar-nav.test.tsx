// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PrimarySidebar } from '../primary-sidebar';

const nav = vi.hoisted(() => ({ pathname: '/astrology' }));

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

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

const auth = vi.hoisted(() => ({
  activeRole: 'TEACHER' as string | null,
  hasStudentRole: false,
  hasTeacherRole: true,
}));

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => auth,
}));

vi.mock('@/components/guide/guide-tour-provider', () => ({
  GuideTourTrigger: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

afterEach(() => {
  cleanup();
  auth.activeRole = 'TEACHER';
  auth.hasStudentRole = false;
  nav.pathname = '/astrology';
});

describe('observatory sidebar for a consultant', () => {
  it('offers the practice tools and nothing else', () => {
    render(<PrimarySidebar />);

    expect(screen.queryByText('Astrologer Service')).not.toBeNull();
    ['Create Gig', 'My Gigs', 'Chats', 'Meetings'].forEach((label) =>
      expect(screen.queryByText(label)).not.toBeNull()
    );
  });

  // The workspace shell owns the dashboard and the student list; duplicating
  // them here would put two of each in a sidebar that already has a Dashboard.
  it('leaves the consultant workspace out of the group', () => {
    render(<PrimarySidebar />);

    expect(screen.queryByText('Consultant Dashboard')).toBeNull();
    expect(screen.queryByText('Astro Students')).toBeNull();
  });

  it('links the group inside the observatory, without chart params', () => {
    render(<PrimarySidebar />);

    const hrefOf = (label: string) =>
      screen.getByText(label).closest('a')?.getAttribute('href');

    expect(hrefOf('Create Gig')).toBe('/astrology/service/gigs/new');
    expect(hrefOf('My Gigs')).toBe('/astrology/service/gigs');
    expect(hrefOf('Chats')).toBe('/astrology/service/chat');
    expect(hrefOf('Meetings')).toBe('/astrology/service/meetings');
  });

  it('keeps the student-only hiring routes out', () => {
    render(<PrimarySidebar />);

    expect(screen.queryByText('Find Astrologer')).toBeNull();
    expect(screen.queryByText('Hire Astrologer')).toBeNull();
  });

  it('lights the group entry whose route is open', () => {
    nav.pathname = '/astrology/service/chat';
    render(<PrimarySidebar />);

    expect(screen.getByText('Chats').closest('a')?.getAttribute('aria-current')).toBe(
      'page'
    );
  });

  // /gigs/new is nested under /gigs, so a plain prefix match would light both.
  it('lights one entry for a nested gig screen', () => {
    nav.pathname = '/astrology/service/gigs/12/edit';
    render(<PrimarySidebar />);

    const current = (label: string) =>
      screen.getByText(label).closest('a')?.getAttribute('aria-current');

    expect(current('My Gigs')).toBe('page');
    expect(current('Create Gig')).toBeNull();
  });
});

describe('observatory sidebar for a student', () => {
  it('offers hiring instead of the astrologer’s tools', () => {
    auth.activeRole = 'STUDENT';
    auth.hasStudentRole = true;
    render(<PrimarySidebar />);

    expect(screen.queryByText('Find Astrologer')).not.toBeNull();
    expect(screen.queryByText('Astrologer Service')).toBeNull();
  });
});
