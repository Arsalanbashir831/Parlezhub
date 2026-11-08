'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import { useResetPassword } from '@/features/auth';
import { ParlezhubAuthShell } from '@/components/parlezhub/auth/auth-shell';
import {
  Field,
  Notice,
  SubmitButton,
  TextLink,
} from '@/components/parlezhub/auth/form';

function Checking({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      {label}
    </div>
  );
}

function ResetPasswordContent() {
  const { status, form, onSubmit, isLoading, error, goToLogin, routes } =
    useResetPassword();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  if (status === 'verifying') {
    return (
      <ParlezhubAuthShell title="Choose a new password">
        <Checking label="Checking your reset link…" />
      </ParlezhubAuthShell>
    );
  }

  if (status === 'invalid') {
    return (
      <ParlezhubAuthShell
        title="This link has expired"
        subtitle="Reset links work once and only for a short while."
      >
        <div className="space-y-5">
          <Notice tone="error">
            This password reset link is invalid or has expired. Request a new
            one and use it straight away.
          </Notice>
          <p className="text-center text-sm">
            <TextLink href={routes.forgotPassword}>Send me a new link</TextLink>
          </p>
        </div>
      </ParlezhubAuthShell>
    );
  }

  if (status === 'done') {
    return (
      <ParlezhubAuthShell title="Password updated">
        <div className="space-y-5">
          <Notice tone="success">
            Your password has been reset. Sign in with your new password.
          </Notice>
          <SubmitButton type="button" onClick={goToLogin}>
            Continue to sign in
          </SubmitButton>
        </div>
      </ParlezhubAuthShell>
    );
  }

  return (
    <ParlezhubAuthShell
      title="Choose a new password"
      subtitle="At least 6 characters."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          register={register('password')}
          error={errors.password}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          register={register('confirmPassword')}
          error={errors.confirmPassword}
        />

        {error && <Notice tone="error">{error}</Notice>}

        <SubmitButton isLoading={isSubmitting} disabled={isLoading} loadingText="Saving…">
          Reset password
        </SubmitButton>

        <p className="text-center text-sm">
          <TextLink href={routes.login}>Back to sign in</TextLink>
        </p>
      </form>
    </ParlezhubAuthShell>
  );
}

export default function ParlezhubResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <ParlezhubAuthShell title="Choose a new password">
          <Checking label="Loading…" />
        </ParlezhubAuthShell>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
