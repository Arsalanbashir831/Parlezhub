import { ConsultantGuard } from '@/components/auth/role-guard';
import AppShellClient from '@/components/layout/app-shell-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ConsultantGuard>
      <AppShellClient role="consultant">{children}</AppShellClient>
    </ConsultantGuard>
  );
}
