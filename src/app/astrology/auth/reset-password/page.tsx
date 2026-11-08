'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import { useResetPassword } from '@/features/auth';
import { AuthButton } from '@/components/astrology/auth/auth-button';
import { AuthLayout } from '@/components/astrology/auth/auth-layout';
import {
  ConfirmPasswordField,
  PasswordField,
} from '@/components/astrology/auth/specialized-fields';
import {
  ErrorMessage,
  SuccessMessage,
} from '@/components/astrology/auth/status-messages';

function ResetPasswordContent() {
  const { status, form, onSubmit, isLoading, error, goToLogin, routes } =
    useResetPassword();
  const {
    register,
    formState: { errors },
  } = form;

  if (status === 'verifying') {
    return (
      <AuthLayout title="Reset Password" subtitle="Verifying link...">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'invalid') {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="The password reset link is invalid or has expired"
      >
        <div className="space-y-6">
          <ErrorMessage message="This password reset link is invalid or has expired. Please request a new one." />
          <div className="text-center">
            <Link
              href={routes.forgotPassword}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'done') {
    return (
      <AuthLayout
        title="Password Reset Successful"
        subtitle="Your password has been successfully updated"
      >
        <div className="space-y-6">
          <SuccessMessage message="Your password has been successfully reset. You can now sign in with your new password." />
          <div className="text-center">
            <AuthButton onClick={goToLogin}>Continue to Sign In</AuthButton>
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
      <form onSubmit={onSubmit} className="space-y-6">
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
            href={routes.login}
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
