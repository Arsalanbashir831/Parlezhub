'use client';

import { useMemo } from 'react';
import { agentNav, studentNav, consultantNav } from '@/lib/nav-config';
import { useServices } from '@/hooks/useServices';

import { AppShell } from './app-shell';

export default function AppShellClient({
  role,
  children,
}: {
  role: 'consultant' | 'student' | 'agent';
  children: React.ReactNode;
}) {
  const { services } = useServices({ enabled: role === 'consultant' });

  const nav = useMemo(() => {
    if (role === 'student') return studentNav;
    if (role === 'agent') return agentNav;

    // Role is consultant
    const hasAstrologyGig = services.some(s => s.type === 'astrology');

    if (hasAstrologyGig) return consultantNav;

    // Filter out astrology-students if no astrology gig
    return consultantNav.filter(item => item.id !== 'astrology-students');
  }, [role, services]);

  return (
    <AppShell
      nav={nav}
      roleLabel={
        role === 'consultant'
          ? 'Consultant'
          : role === 'student'
            ? 'Student'
            : 'Agent'
      }
    >
      {children}
    </AppShell>
  );
}
