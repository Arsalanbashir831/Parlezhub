'use client';

import { useForgotPassword } from '@/features/auth';
import { ParlezhubAuthShell } from '@/components/parlezhub/auth/auth-shell';
import {
  Field,
  Notice,
  SubmitButton,
  TextLink,
} from '@/components/parlezhub/auth/form';

export default function ParlezhubForgotPasswordPage() {
  const { form, onSubmit, isLoading, error, sent, routes } = useForgotPassword();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <ParlezhubAuthShell
      title="Reset your password"
      subtitle="Tell us your email and we'll send you a link to choose a new one."
    >
      {sent ? (
        <div className="space-y-5">
          <Notice tone="info">
            If an account with that email exists, a reset link is on its way.
            Check your inbox (and spam).
          </Notice>
          <p className="text-center text-sm">
            <TextLink href={routes.login}>Back to sign in</TextLink>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            register={register('email')}
            error={errors.email}
          />

          {error && <Notice tone="error">{error}</Notice>}

          <SubmitButton isLoading={isSubmitting} disabled={isLoading} loadingText="Sending…">
            Send reset link
          </SubmitButton>

          <p className="text-center text-sm">
            <TextLink href={routes.login}>Back to sign in</TextLink>
          </p>
        </form>
      )}
    </ParlezhubAuthShell>
  );
}
