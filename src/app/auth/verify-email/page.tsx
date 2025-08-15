'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import { InfoMessage, SuccessMessage } from '@/components/auth/status-messages';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { forgotPassword } = useAuth();

  const handleResendEmail = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setResendCount((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We've sent a verification link to your email address"
    >
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div>
          <p className="mb-4 text-gray-600">
            Please check your email and click the verification link to activate
            your account.
          </p>
          {email && (
            <p className="rounded-lg bg-gray-50 p-3 font-medium text-gray-900">
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
            isLoading={isLoading}
            disabled={!email}
            loadingText="Sending..."
            icon={isLoading ? RefreshCw : undefined}
            onClick={handleResendEmail}
            className="w-full bg-transparent"
          >
            {isLoading ? 'Sending...' : 'Resend Verification Email'}
          </AuthButton>

          <Link href={ROUTES.AUTH.LOGIN}>
            <AuthButton type="button" variant="ghost">
              Back to Sign In
            </AuthButton>
          </Link>
        </div>

        <div className="text-xs text-gray-500">
          <p>
            Having trouble? Contact our support team at{' '}
            <a
              href="mailto:support@linguaflex.com"
              className="text-primary-600 hover:underline"
            >
              support@linguaflex.com
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
