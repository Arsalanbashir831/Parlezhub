// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { RoleBadge } from '@/components/layout/app-shell';

afterEach(cleanup);

describe('role badge', () => {
  it('shows the role label the workspace passes it', () => {
    render(<RoleBadge roleLabel="End User" />);

    expect(screen.getByText('End User')).toBeTruthy();
  });

  it('marks the state with a decorative dot, not a second label', () => {
    const { container } = render(<RoleBadge roleLabel="Consultant" />);

    expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull();
  });

  it('tints the astrologer apart from everybody else', () => {
    const { unmount } = render(<RoleBadge roleLabel="Consultant" />);
    const consultant = screen.getByText('Consultant').className;
    unmount();

    render(<RoleBadge roleLabel="End User" />);
    const endUser = screen.getByText('End User').className;

    expect(consultant).toContain('text-primary-300');
    expect(endUser).not.toContain('text-primary-300');
    expect(consultant).not.toBe(endUser);
  });
});
