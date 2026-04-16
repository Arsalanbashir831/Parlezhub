'use client';

import { useMemo } from 'react';
import { agentNav, studentNav, teacherNav } from '@/lib/nav-config';
import { useServices } from '@/hooks/useServices';

import { AppShell } from './app-shell';

export default function AppShellClient({
  role,
  children,
}: {
  role: 'teacher' | 'student' | 'agent';
  children: React.ReactNode;
}) {
  const { services } = useServices({ enabled: role === 'teacher' });

  const nav = useMemo(() => {
    if (role === 'student') return studentNav;
    if (role === 'agent') return agentNav;

    // Role is teacher
    const hasAstrologyGig = services.some(s => s.type === 'astrology');

    if (hasAstrologyGig) return teacherNav;

    // Filter out astrology-students if no astrology gig
    return teacherNav.filter(item => item.id !== 'astrology-students');
  }, [role, services]);

  return (
    <AppShell
      nav={nav}
      roleLabel={
        role === 'teacher'
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
