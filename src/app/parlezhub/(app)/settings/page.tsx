'use client';

import { ROUTES } from '@/constants/routes';
import { ConsultantGuard } from '@/components/auth/role-guard';
import { AvailabilityEditor } from '@/components/settings/availability-editor';
import { PageHeader } from '@/components/parlezhub/ui';

/** /parlezhub/settings — the consultant's weekly availability. */
export default function ParlezhubSettingsPage() {
  return (
    <ConsultantGuard fallbackPath={ROUTES.PARLEZHUB.ROOT}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Settings"
          title="Availability"
          description="Set the hours learners can book you each week. You can add more than one time range per day."
        />
        <AvailabilityEditor />
      </div>
    </ConsultantGuard>
  );
}
