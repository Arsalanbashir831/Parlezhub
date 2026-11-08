'use client';

import Link from 'next/link';

import { useSignIn } from '@/features/auth';
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button';
import { AuthButton } from '@/components/astrology/auth/auth-button';
import { AuthLayout } from '@/components/astrology/auth/auth-layout';
import {
  EmailField,
  PasswordField,
} from '@/components/astrology/auth/specialized-fields';

export default function LoginPage() {
  const { form, onSubmit, isLoading, routes } = useSignIn();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <EmailField register={register('email')} error={errors.email} />

        <PasswordField
          register={register('password')}
          error={errors.password}
        />

        <AuthButton type="submit" isLoading={isLoading}>
          Sign In
        </AuthButton>

        <div className="flex items-center gap-3">
          <span className="hairline h-px flex-1" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            or
          </p>
          <span className="hairline h-px flex-1" />
        </div>

        <GoogleOAuthButton
          disabled={isLoading}
          className="w-full"
        />

        <div className="text-center">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href={routes.signup}
              className="font-medium text-ember transition-colors hover:text-ember-soft"
            >
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            <Link
              href={routes.forgotPassword}
              className="font-medium text-ember transition-colors hover:text-ember-soft"
            >
              Forgot your password?
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
