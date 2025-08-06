import { StudentGuard } from '@/components/auth/role-guard';
import AppShellClient from '@/components/layout/app-shell-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StudentGuard>
      <AppShellClient role="student">{children}</AppShellClient>
    </StudentGuard>
  );
}
