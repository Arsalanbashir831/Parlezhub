'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/services/auth';

import { resetPasswordSchema, type ResetPasswordFormData } from './schemas';
import { useCurrentApp } from './use-current-app';

export type ResetPasswordStatus = 'verifying' | 'invalid' | 'done' | 'form';

/** Needs a Suspense boundary above it (it reads the search params). */
export function useResetPassword() {
  const { resetPassword, isLoading, error, isAuthenticated } = useAuth();
  const { routes } = useCurrentApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasSession, setHasSession] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // A recovery link either arrives with ?code= (PKCE) or lands here with the
  // recovery session already stored in httpOnly cookies by the auth callback.
  // No credential is ever read from the URL.
  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const code = searchParams.get('code');
      try {
        const snapshot = code
          ? await authApi.exchangeCode(code)
          : await authApi.session();
        if (!cancelled) setHasSession(snapshot.isAuthenticated);
      } catch (err) {
        console.error('Failed to verify reset link:', err);
        if (!cancelled) setHasSession(false);
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await resetPassword(data.password);
  });

  const status: ResetPasswordStatus =
    isVerifying || (isLoading && !form.formState.isSubmitting)
      ? 'verifying'
      : !hasSession && !isAuthenticated
        ? 'invalid'
        : form.formState.isSubmitSuccessful && !error
          ? 'done'
          : 'form';

  return {
    status,
    form,
    onSubmit,
    isLoading,
    error,
    goToLogin: () => router.push(routes.login),
    routes,
  };
}
