'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';

import { useCurrentApp } from './use-current-app';

export function useVerifyEmail() {
  const { resendVerificationEmail } = useAuth();
  const { routes } = useCurrentApp();
  const email = useSearchParams().get('email');
  const [isSending, setIsSending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const resend = async () => {
    if (!email) return;

    setIsSending(true);
    try {
      await resendVerificationEmail(email);
      setResendCount((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return { email, isSending, resendCount, resend, routes };
}
