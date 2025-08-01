import type { Metadata } from 'next';

import { Nav } from '@/components/agents/hume/nav';

export const metadata: Metadata = {
  title: 'Hume AI - EVI - Next.js Starter',
  description: "A Next.js starter using Hume AI's Empathic Voice Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
