import { TeacherGuard } from '@/components/auth/role-guard';
import AppShellClient from '@/components/layout/app-shell-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TeacherGuard>
      <AppShellClient role="teacher">{children}</AppShellClient>
    </TeacherGuard>
  );
}
