'use client';

import { studentNav, teacherNav } from '@/lib/nav-config';

import { AppShell } from './app-shell';

export default function AppShellClient({
  role,
  children,
}: {
  role: 'teacher' | 'student';
  children: React.ReactNode;
}) {
  const nav = role === 'teacher' ? teacherNav : studentNav;
  return (
    <AppShell nav={nav} roleLabel={role === 'teacher' ? 'Teacher' : 'Student'}>
      {children}
    </AppShell>
  );
}
