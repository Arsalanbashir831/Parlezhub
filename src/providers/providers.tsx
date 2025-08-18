'use client';

import type React from 'react';
import { Suspense } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { TranscriptProvider } from '@/contexts/transcript-context';
import { UserProvider } from '@/contexts/user-context';
import { QueryProvider } from '@/providers/query-provider';

import { Toaster } from '@/components/ui/sonner';
import AuthFlowHandler from '@/components/auth/auth-flow-handler';

function ProvidersContent({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <AuthFlowHandler />
            <SessionProvider>
              <TranscriptProvider>{children}</TranscriptProvider>
            </SessionProvider>
          </UserProvider>
        </AuthProvider>
        <Toaster richColors />
      </ThemeProvider>
    </QueryProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProvidersContent>{children}</ProvidersContent>
    </Suspense>
  );
}
