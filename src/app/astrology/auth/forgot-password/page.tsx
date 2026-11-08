'use client';

import Link from 'next/link';

import { useForgotPassword } from '@/features/auth';
import { AuthButton } from '@/components/astrology/auth/auth-button';
import { AuthLayout } from '@/components/astrology/auth/auth-layout';
import { EmailField } from '@/components/astrology/auth/specialized-fields';
import {
  ErrorMessage,
  InfoMessage,
} from '@/components/astrology/auth/status-messages';

export default function ForgotPasswordPage() {
  const { form, onSubmit, isLoading, error, sent, routes } = useForgotPassword();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      {sent ? (
        <div className="space-y-6">
          <InfoMessage message="If an account with that email exists, we've sent you a password reset link." />
          <div className="text-center">
            <Link
              href={routes.login}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <EmailField
            placeholder="Enter your email address"
            register={register('email')}
            error={errors.email}
          />

          {error && <ErrorMessage message={error} />}

          <AuthButton type="submit" isLoading={isLoading}>
            Send Reset Link
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
      )}
    </AuthLayout>
  );
}
