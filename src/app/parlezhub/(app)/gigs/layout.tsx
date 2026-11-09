import { ROUTES } from '@/constants/routes';
import { ConsultantGuard } from '@/components/auth/role-guard';

/** Gigs belong to the consultant profile; a learner is sent to the dashboard. */
export default function ParlezhubGigsLayout({ children }: { children: React.ReactNode }) {
  return <ConsultantGuard fallbackPath={ROUTES.PARLEZHUB.ROOT}>{children}</ConsultantGuard>;
}
