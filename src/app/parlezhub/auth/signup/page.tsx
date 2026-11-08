'use client';

import { Lock, Mail, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

import { useSignUp } from '@/features/auth';
import { ParlezhubAuthShell } from '@/components/parlezhub/auth/auth-shell';
import {
  Divider,
  Field,
  GoogleButton,
  Notice,
  SubmitButton,
  TextLink,
} from '@/components/parlezhub/auth/form';

export default function ParlezhubSignUpPage() {
  const { form, onSubmit, isLoading, error, redirecting, routes } = useSignUp();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  if (redirecting) return null;

  return (
    <ParlezhubAuthShell
      title="Create Account"
      subtitle="Start your language learning journey with ParlezHub"
    >
      <div className="space-y-6">
        <GoogleButton disabled={isLoading} />

        <Divider />

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field
            label="Full Name"
            icon={User}
            required
            autoComplete="name"
            placeholder="Your full name"
            register={register('full_name')}
            error={errors.full_name}
          />
          <Field
            label="Email Address"
            type="email"
            icon={Mail}
            required
            autoComplete="email"
            placeholder="you@example.com"
            register={register('email')}
            error={errors.email}
          />
          <Field
            label="Password"
            type="password"
            icon={Lock}
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
            register={register('password')}
            error={errors.password}
          />
          <Field
            label="Confirm Password"
            type="password"
            icon={Lock}
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            register={register('confirmPassword')}
            error={errors.confirmPassword}
          />

          {error && <Notice tone="error">{error}</Notice>}

          <div className="pt-1">
            <SubmitButton
              isLoading={isSubmitting}
              disabled={isLoading}
              loadingText="Creating your account…"
              withArrow
            >
              Create Account
            </SubmitButton>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account you agree to our{' '}
            <TextLink href={ROUTES.TERMS}>Terms</TextLink> and{' '}
            <TextLink href={ROUTES.PRIVACY}>Privacy Policy</TextLink>.
          </p>
        </form>

        <p className="text-center text-[15px] text-foreground">
          Already have an account? <TextLink href={routes.login}>Sign In</TextLink>
        </p>
      </div>
    </ParlezhubAuthShell>
  );
}
