'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { landingPathFor } from '@/lib/guard-rules';
import { getErrorMessage } from '@/lib/error-utils';
import { authApi } from '@/services/auth';
import type { SessionSnapshot } from '@/types/auth';
import { toast } from 'sonner';

/**
 * Generates a cryptographic nonce pair:
 * - `nonce` (raw)     → sent to our server, which passes it to Supabase
 * - `hashedNonce`     → passed to Google's data-nonce attribute (SHA-256 hex)
 *
 * Supabase expects the provider to hash the nonce, so Google receives the
 * hashed version and Supabase receives the raw version.
 */
async function generateNonce(): Promise<[string, string]> {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
  );
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return [nonce, hashedNonce];
}

/** Time the failure toast stays visible before middleware takes over. */
const FAILURE_MESSAGE_MS = 3000;

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (callback?: (notification: unknown) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

/**
 * GoogleOneTap — displays the Google One-Tap prompt.
 *
 * Flow:
 * 1. User taps "Continue as <name>" in the One-Tap UI
 * 2. Google returns an ID token (credential)
 * 3. The credential goes to /api/auth/google-id-token, which exchanges it with
 *    Supabase, syncs the Django record and resolves roles — all server-side,
 *    so the resulting session lands in httpOnly cookies the browser cannot read
 * 4. New user → /onboarding/choose-role, returning user → their dashboard
 */
export function GoogleOneTap() {
  const searchParams = useSearchParams();
  const [isWorking, setIsWorking] = useState(false);

  const initializeOneTap = async (isCancelled: () => boolean) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window === 'undefined' || !window.google || !clientId) return;

    // Don't show One-Tap if user is already signed in
    try {
      const { isAuthenticated } = await authApi.session();
      if (isAuthenticated || isCancelled()) return;
    } catch {
      // Treat an unreadable session as signed out; the exchange will fail loudly.
      if (isCancelled()) return;
    }

    const [nonce, hashedNonce] = await generateNonce();
    if (isCancelled()) return;

    const onboardingUrl = (redirectTo: string | null) =>
      redirectTo
        ? `${ROUTES.ONBOARDING.CHOOSE_ROLE}?redirect=${encodeURIComponent(redirectTo)}`
        : ROUTES.ONBOARDING.CHOOSE_ROLE;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        const redirectTo = searchParams.get('redirect');
        setIsWorking(true);
        try {
          const snapshot: SessionSnapshot = await authApi.googleIdToken(
            response.credential,
            nonce
          );

          const destination =
            snapshot.requiresRoleSelection ||
            (!snapshot.rolesUnknown && snapshot.userRoles.length === 0)
              ? onboardingUrl(redirectTo)
              : snapshot.rolesUnknown
                ? // Roles haven't resolved yet; middleware and the guard finish
                  // the job instead of offering a choice this user may already have.
                  redirectTo || '/'
                : landingPathFor(snapshot, redirectTo);

          // Hard navigation, not router.push: the session cookies are brand new
          // while this page's in-memory auth state still says "signed out". A
          // client-side push would render the dashboard against that stale state
          // and leave nothing on screen until a manual reload.
          window.location.replace(destination);
        } catch (err) {
          console.error('[One-Tap] Authentication error:', err);
          setIsWorking(false);
          toast.error('Google sign-in failed', {
            description: getErrorMessage(err, 'google-one-tap'),
          });
          // Let middleware decide once the message has been read: it sends a live
          // session to its dashboard or onboarding, an anonymous browser to sign-in.
          setTimeout(
            () => window.location.replace(redirectTo || '/'),
            FAILURE_MESSAGE_MS
          );
        }
      },
      nonce: hashedNonce,
      // Required for Chrome's third-party cookie phase-out (FedCM)
      use_fedcm_for_prompt: true,
      auto_select: false,
      itp_support: true,
    });

    // No prompt-status callback: Google logs a deprecation warning for any
    // callback using the pre-FedCM display/skipped moment API.
    window.google.accounts.id.prompt();
  };

  // Injected imperatively: React 19 warns ("Encountered a script tag while
  // rendering React component") for any <script> produced during render, which
  // includes next/script on client navigations.
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    const start = () => void initializeOneTap(() => cancelled);

    if (window.google?.accounts?.id) {
      start();
      return () => {
        cancelled = true;
      };
    }

    const id = 'gsi-client-script';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      document.head.appendChild(script);
    }

    script.addEventListener('load', start);
    return () => {
      cancelled = true;
      script?.removeEventListener('load', start);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The credential exchange, the Django sync and the role lookup all happen
  // before the browser can move, so the wait needs to look intentional.
  if (!isWorking) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        Signing you in…
      </p>
    </div>
  );
}
