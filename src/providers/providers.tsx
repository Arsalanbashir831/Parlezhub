'use client';

import type React from 'react';
import { Suspense } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { TranscriptProvider } from '@/contexts/transcript-context';
import { UserProvider } from '@/contexts/user-context';
import { QueryProvider } from '@/providers/query-provider';

import { Toaster } from '@/components/ui/sonner';
import { GoogleOneTap } from '@/components/auth/google-one-tap';

import { ThemeProvider } from 'next-themes';

function ProvidersContent({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryProvider>
        <AuthProvider>
          <GoogleOneTap />
          <UserProvider>
            <SessionProvider>
              <TranscriptProvider>{children}</TranscriptProvider>
            </SessionProvider>
          </UserProvider>
        </AuthProvider>
        <Toaster richColors />
      </QueryProvider>
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProvidersContent>{children}</ProvidersContent>
    </Suspense>
  );
}
