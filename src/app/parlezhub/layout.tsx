import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import './parlezhub.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-parlezhub',
});

/**
 * Parlezhub (AI language tutor) app root: everything under /parlezhub — its
 * auth pages, onboarding and the app itself. Shares Shakti Wheel's accounts,
 * roles and auth flow (src/features/auth); only the UI and theme
 * (parlezhub.css, scoped by `data-app`) are its own.
 */
export const metadata: Metadata = {
  title: {
    default: 'ParlezHub — AI language tutor',
    template: '%s · ParlezHub',
  },
  description:
    'Practise speaking any language with an AI tutor, and book sessions with language consultants.',
};

export default function ParlezhubAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-app="parlezhub"
      className={`${jakarta.variable} min-h-screen bg-background text-foreground antialiased`}
    >
      {children}
    </div>
  );
}
