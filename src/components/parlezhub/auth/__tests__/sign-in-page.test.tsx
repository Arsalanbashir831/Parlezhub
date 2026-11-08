// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ParlezhubSignInPage from '@/app/parlezhub/auth/sign-in/page';

const auth = vi.hoisted(() => ({
  isLoading: false,
  isAuthenticated: false,
  userRoles: [] as string[],
  login: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

vi.mock('@/contexts/auth-context', () => ({ useAuth: () => auth }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/parlezhub/auth/sign-in',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
}));

// vitest.config.mts disables globals, so Testing Library cannot register its own cleanup hook.
afterEach(cleanup);

beforeEach(() => {
  auth.isLoading = false;
  auth.login.mockReset();
});

const submit = () => screen.getByRole('button', { name: /sign/i, hidden: false });

describe('ParlezHub sign-in page', () => {
  it('links to Parlezhub’s own sign-up and reset pages', () => {
    render(<ParlezhubSignInPage />);

    expect(screen.getByRole('link', { name: 'Create Account' }).getAttribute('href')).toBe(
      '/parlezhub/auth/signup'
    );
    expect(screen.getByRole('link', { name: 'Forgot Password?' }).getAttribute('href')).toBe(
      '/parlezhub/auth/forgot-password'
    );
  });

  it('waits out the session check without claiming to sign in', () => {
    auth.isLoading = true;
    render(<ParlezhubSignInPage />);

    const button = screen.getByRole('button', { name: 'Sign In' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText('Signing in…')).toBeNull();
  });

  it('says it is signing in only while the form is submitting', async () => {
    let finish: () => void = () => undefined;
    auth.login.mockImplementation(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<ParlezhubSignInPage />);

    fireEvent.change(screen.getByLabelText(/^Email Address/), { target: { value: 'a@b.test' } });
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'secret1' } });
    fireEvent.click(submit());

    await waitFor(() => expect(screen.queryByText('Signing in…')).not.toBeNull());
    expect(auth.login).toHaveBeenCalledWith('a@b.test', 'secret1');

    finish();
    await waitFor(() => expect(screen.queryByText('Signing in…')).toBeNull());
  });
});
