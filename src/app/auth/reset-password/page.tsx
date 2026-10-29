'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/services/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import {
  ConfirmPasswordField,
  PasswordField,
} from '@/components/auth/specialized-fields';
import {
  ErrorMessage,
  SuccessMessage,
} from '@/components/auth/status-messages';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const { resetPassword, isLoading, error, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasSession, setHasSession] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // A recovery link either arrives with ?code= (PKCE) or lands here with the
  // recovery session already stored in httpOnly cookies by /auth/callback.
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    await resetPassword(data.password);
  };

  // Show loading while verifying the link or waiting for auth
  if (isVerifying || authLoading) {
    return (
      <AuthLayout title="Reset Password" subtitle="Verifying link...">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!hasSession && !isAuthenticated) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="The password reset link is invalid or has expired"
      >
        <div className="space-y-6">
          <ErrorMessage message="This password reset link is invalid or has expired. Please request a new one." />
          <div className="text-center">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isSubmitSuccessful && !error) {
    return (
      <AuthLayout
        title="Password Reset Successful"
        subtitle="Your password has been successfully updated"
      >
        <div className="space-y-6">
          <SuccessMessage message="Your password has been successfully reset. You can now sign in with your new password." />
          <div className="text-center">
            <AuthButton onClick={() => router.push(ROUTES.AUTH.LOGIN)}>
              Continue to Sign In
            </AuthButton>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PasswordField
          placeholder="Enter your new password"
          register={register('password')}
          error={errors.password}
        />

        <ConfirmPasswordField
          register={register('confirmPassword')}
          error={errors.confirmPassword}
        />

        {error && <ErrorMessage message={error} />}

        <AuthButton type="submit" isLoading={isLoading}>
          Reset Password
        </AuthButton>

        <div className="text-center">
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Reset Password" subtitle="Loading...">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
