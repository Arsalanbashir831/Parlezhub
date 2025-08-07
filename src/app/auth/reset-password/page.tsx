'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
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
  const { resetPassword, isLoading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  // Extract token from hash fragment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      setToken(accessToken);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    await resetPassword(token, data.password);
  };

  if (!token) {
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
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
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
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
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
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
