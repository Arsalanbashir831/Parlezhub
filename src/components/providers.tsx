'use client';

import type React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { TranscriptProvider } from '@/contexts/transcript-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SessionProvider>
          <TranscriptProvider>{children}</TranscriptProvider>
        </SessionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
