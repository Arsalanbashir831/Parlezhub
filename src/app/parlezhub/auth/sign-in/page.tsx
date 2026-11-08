'use client';

import { Lock, Mail } from 'lucide-react';

import { useSignIn } from '@/features/auth';
import { ParlezhubAuthShell } from '@/components/parlezhub/auth/auth-shell';
import {
  Divider,
  Field,
  GoogleButton,
  SubmitButton,
  TextLink,
} from '@/components/parlezhub/auth/form';

export default function ParlezhubSignInPage() {
  const { form, onSubmit, isLoading, routes } = useSignIn();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <ParlezhubAuthShell
      title="Welcome Back!"
      subtitle="Continue your language learning journey with ParlezHub"
    >
      <div className="space-y-6">
        <GoogleButton disabled={isLoading} />

        <Divider />

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
            autoComplete="current-password"
            placeholder="Enter your password"
            labelAside={
              <TextLink href={routes.forgotPassword}>Forgot Password?</TextLink>
            }
            register={register('password')}
            error={errors.password}
          />

          <div className="pt-1">
            <SubmitButton
              isLoading={isSubmitting}
              disabled={isLoading}
              loadingText="Signing in…"
              withArrow
            >
              Sign In
            </SubmitButton>
          </div>
        </form>

        <p className="text-center text-[15px] text-foreground">
          Don&apos;t have an account?{' '}
          <TextLink href={routes.signup}>Create Account</TextLink>
        </p>
      </div>
    </ParlezhubAuthShell>
  );
}
