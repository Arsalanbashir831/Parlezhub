import { ROUTES } from '@/constants/routes';

import { ConsultantGuard } from '@/components/auth/role-guard';

export default function AstrologerServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsultantGuard fallbackPath={ROUTES.AGENT.ASTROLOGY.ROOT}>
      {children}
    </ConsultantGuard>
  );
}
