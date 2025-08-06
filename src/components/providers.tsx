'use client';

import type React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { TranscriptProvider } from '@/contexts/transcript-context';
import { UserProvider } from '@/contexts/user-context';
import { QueryProvider } from '@/providers/query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <SessionProvider>
              <TranscriptProvider>{children}</TranscriptProvider>
            </SessionProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
