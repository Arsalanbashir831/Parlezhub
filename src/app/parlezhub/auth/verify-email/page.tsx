'use client';

import { MailCheck } from 'lucide-react';

import { useVerifyEmail } from '@/features/auth';
import { ParlezhubAuthShell } from '@/components/parlezhub/auth/auth-shell';
import {
  Notice,
  SubmitButton,
  TextLink,
} from '@/components/parlezhub/auth/form';

export default function ParlezhubVerifyEmailPage() {
  const { email, isSending, resendCount, resend, routes } = useVerifyEmail();

  return (
    <ParlezhubAuthShell
      title="Check your inbox"
      subtitle="Click the link we sent to activate your account."
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MailCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="min-w-0 text-sm text-secondary-foreground">
            {email ? (
              <>
                Sent to <span className="break-all font-bold">{email}</span>
              </>
            ) : (
              'Sent to the email address you signed up with.'
            )}
          </p>
        </div>

        <Notice tone="info">
          Nothing yet? Check your spam folder, or send the email again.
        </Notice>

        {resendCount > 0 && (
          <Notice tone="success">A new verification email is on its way.</Notice>
        )}

        <SubmitButton
          type="button"
          variant="secondary"
          isLoading={isSending}
          loadingText="Sending…"
          disabled={!email}
          onClick={resend}
        >
          Resend verification email
        </SubmitButton>

        <p className="text-center text-sm">
          <TextLink href={routes.login}>Back to sign in</TextLink>
        </p>
      </div>
    </ParlezhubAuthShell>
  );
}
