import type React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import 'driver.js/dist/driver.css';
import './globals.css';

import { Providers } from '@/providers/providers';
import Script from 'next/script';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Shakti Wheel — Vedic Astrology',
  description:
    'Birth charts, Vimshottari Dasha timelines, festival calendars and traditional interpretations from your own chart data',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        <Script
          id="gsi-client-script"
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
