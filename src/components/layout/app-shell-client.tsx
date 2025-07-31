'use client';

import { agentNav, studentNav, teacherNav } from '@/lib/nav-config';

import { AppShell } from './app-shell';

export default function AppShellClient({
  role,
  children,
}: {
  role: 'teacher' | 'student' | 'agent';
  children: React.ReactNode;
}) {
  const nav =
    role === 'teacher'
      ? teacherNav
      : role === 'student'
        ? studentNav
        : agentNav;
  return (
    <AppShell
      nav={nav}
      roleLabel={
        role === 'teacher'
          ? 'Teacher'
          : role === 'student'
            ? 'Student'
            : 'Agent'
      }
    >
      {children}
    </AppShell>
  );
}
