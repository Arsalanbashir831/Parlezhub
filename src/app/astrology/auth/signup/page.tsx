'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import { useSignUp } from '@/features/auth';
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button';
import { AuthButton } from '@/components/astrology/auth/auth-button';
import { AuthLayout } from '@/components/astrology/auth/auth-layout';
import {
  ConfirmPasswordField,
  EmailField,
  NameField,
  PasswordField,
} from '@/components/astrology/auth/specialized-fields';
import { ErrorMessage } from '@/components/astrology/auth/status-messages';

export default function SignupPage() {
  const { form, onSubmit, isLoading, error, redirecting, routes } = useSignUp();
  const {
    register,
    formState: { errors },
  } = form;

  if (redirecting) return null;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Your birth chart, Dasha timeline and readings, in one place"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <NameField register={register('full_name')} error={errors.full_name} />

        <EmailField register={register('email')} error={errors.email} />

        <PasswordField
          register={register('password')}
          error={errors.password}
        />

        <ConfirmPasswordField
          register={register('confirmPassword')}
          error={errors.confirmPassword}
        />


        {error && <ErrorMessage message={error} />}

        <AuthButton type="submit" isLoading={isLoading}>
          Create Account
        </AuthButton>

        <div className="flex items-center gap-3">
          <span className="hairline h-px flex-1" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            or
          </p>
          <span className="hairline h-px flex-1" />
        </div>

        <GoogleOAuthButton disabled={isLoading} className="w-full" />

        <div className="text-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{' '}
            <Link
              href={routes.login}
              className="font-medium text-ember transition-colors hover:text-ember-soft"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-xs text-neutral-600">
            By creating an account, you agree to our{' '}
            <Link
              href={ROUTES.TERMS}
              className="text-neutral-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href={ROUTES.PRIVACY}
              className="text-neutral-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
