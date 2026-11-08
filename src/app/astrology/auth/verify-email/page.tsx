'use client';

import Link from 'next/link';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';

import { useVerifyEmail } from '@/features/auth';
import { AuthButton } from '@/components/astrology/auth/auth-button';
import { AuthLayout } from '@/components/astrology/auth/auth-layout';
import {
  InfoMessage,
  SuccessMessage,
} from '@/components/astrology/auth/status-messages';

export default function VerifyEmailPage() {
  const { email, isSending, resendCount, resend, routes } = useVerifyEmail();

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We've sent a verification link to your email address"
    >
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ember/30 bg-ember/10">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div>
          <p className="mb-4 text-neutral-400">
            Please check your email and click the verification link to activate
            your account.
          </p>
          {email && (
            <p className="rounded-lg border border-ember/30 bg-ember/10 p-3 font-medium text-ember-soft">
              {email}
            </p>
          )}
        </div>

        <InfoMessage
          message={
            <>
              <strong>Didn&rsquo;t receive the email?</strong>
              <br />
              Check your spam folder or click the resend button below.
            </>
          }
        />

        {resendCount > 0 && (
          <SuccessMessage
            message="Verification email sent successfully!"
            icon={CheckCircle}
          />
        )}

        <div className="space-y-3">
          <AuthButton
            type="button"
            variant="outline"
            isLoading={isSending}
            disabled={!email}
            loadingText="Sending..."
            icon={isSending ? RefreshCw : undefined}
            onClick={resend}
            className="w-full bg-transparent"
          >
            {isSending ? 'Sending...' : 'Resend Verification Email'}
          </AuthButton>

          <Link href={routes.login} className="block">
            <AuthButton type="button" variant="ghost">
              Back to Sign In
            </AuthButton>
          </Link>
        </div>

        <div className="text-xs text-neutral-500">
          <p>
            Having trouble? Contact our support team at{' '}
            <a
              href="mailto:support@shaktiwheel.com"
              className="text-primary-600 hover:underline"
            >
              support@shaktiwheel.com
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
