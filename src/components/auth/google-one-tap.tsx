'use client';

import Script from 'next/script';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { authApi } from '@/services/auth';
import { ROUTES } from '@/constants/routes';
import { setCookie, setActiveRole, setUserRoles } from '@/lib/cookie-utils';

/**
 * Generates a cryptographic nonce pair:
 * - `nonce` (raw)     → passed to supabase.auth.signInWithIdToken()
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

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
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
 * 3. We exchange it with Supabase for a full session
 * 4. We immediately call Django /api/auth/sync/ with the access_token
 *    — this creates the Django user record before anything else happens
 * 5. If new user → redirect to /onboarding/choose-role
 * 6. If returning user → set role cookies and redirect to dashboard
 *
 * Why we call syncUser BEFORE refreshUserProfile:
 * Supabase fires onAuthStateChange('SIGNED_IN') the moment signInWithIdToken
 * resolves. The auth-context listener may try to call GET /accounts/profiles/me/roles/
 * simultaneously. If that hits Django before the user is synced, it gets a 404.
 * By awaiting syncUser here first and catching errors in the auth-context listener,
 * we avoid the race condition.
 */
export function GoogleOneTap() {
  const router = useRouter();
  const supabase = createClient();

  const initializeOneTap = async () => {
    if (typeof window === 'undefined' || !window.google) return;

    // Don't show One-Tap if user is already signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return;

    const [nonce, hashedNonce] = await generateNonce();

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: { credential: string }) => {
        try {
          // Step 1: Exchange Google ID token for Supabase session
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
            nonce,
          });

          if (error) throw error;
          if (!data.session) throw new Error('No session returned');

          const accessToken = data.session.access_token;

          // Step 2: Sync with Django — MUST complete before any profile fetch.
          // This call creates the Django User record if it doesn't exist.
          let syncResult;
          try {
            syncResult = await authApi.syncUser(accessToken);
          } catch (syncErr) {
            console.error('[One-Tap] Django sync failed:', syncErr);
            // Even if sync fails, user is authenticated in Supabase.
            // Redirect to onboarding so they can retry via set-role.
            router.push(ROUTES.ONBOARDING.CHOOSE_ROLE);
            return;
          }

          // Step 3: Route based on sync result
          if (syncResult.requires_role_selection) {
            // New user — go pick a role
            router.push(ROUTES.ONBOARDING.CHOOSE_ROLE);
          } else {
            // Returning user — fetch their profile and go to dashboard
            try {
              const profile = await authApi.getUnifiedProfile();
              const roles: ('TEACHER' | 'STUDENT')[] = [];
              if (profile.has_teacher) roles.push('TEACHER');
              if (profile.has_student) roles.push('STUDENT');
              setUserRoles(roles);
              const role = roles[0] ?? 'STUDENT';
              setActiveRole(role);
              router.push(
                role === 'TEACHER'
                  ? ROUTES.TEACHER.DASHBOARD
                  : ROUTES.STUDENT.DASHBOARD
              );
            } catch {
              // Profile fetch failed for unexpected reason — go home, middleware will route
              router.push(ROUTES.HOME);
            }
          }
        } catch (err) {
          console.error('[One-Tap] Authentication error:', err);
        }
      },
      nonce: hashedNonce,
      // Required for Chrome's third-party cookie phase-out (FedCM)
      use_fedcm_for_prompt: true,
      auto_select: false,
      itp_support: true,
    });

    window.google.accounts.id.prompt();
  };

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      onReady={() => {
        initializeOneTap();
      }}
      strategy="afterInteractive"
    />
  );
}
