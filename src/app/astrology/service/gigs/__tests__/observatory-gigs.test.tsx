// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AstrologerGigsPage from '../page';
import type { Service } from '@/types/service';

const nav = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode } & Record<string, unknown>) => (
    <a href={String(href)} {...rest}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => nav,
}));

const natal = {
  id: '1',
  teacherId: 't1',
  type: 'astrology',
  title: 'A career read from your dasha',
  shortDescription: 'Ninety minutes on work, timing and the next move.',
  description: 'Long description',
  price: 120,
  duration: 90,
  tags: ['Career', 'Dasha timing'],
  whatYouProvide: ['Written summary'],
  status: 'active',
  createdAt: '',
  updatedAt: '',
  totalSessions: 7,
  averageRating: 4.8,
  reviewCount: 5,
} satisfies Service;

const state = vi.hoisted(() => ({
  services: [] as unknown[],
  filtered: [] as unknown[],
  filters: {} as Record<string, unknown>,
  isLoading: false,
  error: null as string | null,
  setFilters: vi.fn(),
  deleteExistingService: vi.fn(async () => '1'),
  toggleServiceStatus: vi.fn(async () => null),
}));

vi.mock('@/hooks/useServices', () => ({
  useServices: () => ({
    get services() { return state.services; },
    get filteredServices() { return state.filtered; },
    get filters() { return state.filters; },
    get isLoading() { return state.isLoading; },
    get error() { return state.error; },
    setFilters: state.setFilters,
    deleteExistingService: state.deleteExistingService,
    toggleServiceStatus: state.toggleServiceStatus,
    stats: { totalServices: 2, activeServices: 1, totalSessions: 9, totalEarnings: 1080, averageRating: 4.8 },
  }),
}));

afterEach(() => {
  cleanup();
  state.services = [];
  state.filtered = [];
  state.filters = {};
  state.error = null;
  vi.clearAllMocks();
});

describe('observatory My Gigs', () => {
  it('counts the practice in tiles', () => {
    render(<AstrologerGigsPage />);

    expect(screen.getByText('$1,080')).not.toBeNull();
    expect(screen.getByText('9')).not.toBeNull();
  });

  it('offers one composer entry point in the header and the empty state', () => {
    render(<AstrologerGigsPage />);

    const links = screen.getAllByRole('link', { name: /Add a gig|Create a gig/ });
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/astrology/service/gigs/new',
      '/astrology/service/gigs/new',
    ]);
  });

  it('says what an empty account is missing', () => {
    render(<AstrologerGigsPage />);

    expect(screen.queryByText('Your first gig starts here')).not.toBeNull();

    state.filters = { searchQuery: 'marriage' };
    render(<AstrologerGigsPage />);
    expect(screen.queryByText('No gig matches this filter')).not.toBeNull();
  });

  it('presses the status filter the list is currently showing', () => {
    state.filters = { status: 'active' };
    render(<AstrologerGigsPage />);

    const group = screen.getByRole('group', { name: 'Filter by status' });
    expect(within(group).getByRole('button', { name: 'Live' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(group).getByRole('button', { name: 'Paused' }).getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(within(group).getByRole('button', { name: 'All gigs' }));
    expect(state.setFilters).toHaveBeenCalledWith({ status: undefined });
  });

  it('pauses a live gig from its own card', () => {
    state.services = [natal];
    state.filtered = [natal];
    render(<AstrologerGigsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(state.toggleServiceStatus).toHaveBeenCalledWith('1', 'inactive');
  });

  it('opens the full description only when asked', () => {
    state.services = [natal];
    state.filtered = [natal];
    render(<AstrologerGigsPage />);

    expect(screen.queryByText('Long description')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Read the full description/ }));
    expect(screen.getByText('Long description')).not.toBeNull();
    expect(screen.getByText('Written summary')).not.toBeNull();
  });

  it('routes the edit button to the gig’s own screen', () => {
    state.services = [natal];
    state.filtered = [natal];
    render(<AstrologerGigsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(nav.push).toHaveBeenCalledWith('/astrology/service/gigs/1/edit');
  });
});
