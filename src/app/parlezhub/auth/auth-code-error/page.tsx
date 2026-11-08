'use client';

import Link from 'next/link';

import { useCurrentApp } from '@/features/auth';
import { ParlezhubAuthShell } from '@/components/parlezhub/auth/auth-shell';
import { Notice } from '@/components/parlezhub/auth/form';

export default function ParlezhubAuthCodeErrorPage() {
  const { routes } = useCurrentApp();

  return (
    <ParlezhubAuthShell
      title="We couldn't sign you in"
      subtitle="Something went wrong while confirming your sign-in."
    >
      <div className="space-y-5">
        <Notice tone="error">
          The link you followed may have expired or already been used. Try
          signing in again.
        </Notice>
        <Link
          href={routes.login}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to sign in
        </Link>
      </div>
    </ParlezhubAuthShell>
  );
}
