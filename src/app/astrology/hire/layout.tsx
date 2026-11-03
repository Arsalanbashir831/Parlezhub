import { ROUTES } from '@/constants/routes';

import { StudentGuard } from '@/components/auth/role-guard';

export default function HireAstrologerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentGuard fallbackPath={ROUTES.AGENT.ASTROLOGY.ROOT}>
      {children}
    </StudentGuard>
  );
}
