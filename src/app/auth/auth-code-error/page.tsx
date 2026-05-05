'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthButton } from '@/components/auth/auth-button';
import { AlertCircle } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <AuthLayout
      title="Authentication Error"
      subtitle="Something went wrong during the sign-in process"
    >
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            The authentication link you followed may have expired or is no longer valid.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Please try signing in again. If you continue to experience issues, contact support.
          </p>
        </div>

        <Link href={ROUTES.AUTH.LOGIN} className="w-full">
          <AuthButton type="button" className="w-full">
            Return to Sign In
          </AuthButton>
        </Link>

        <div className="text-sm">
          <Link
            href={ROUTES.LANDING_PAGE}
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
