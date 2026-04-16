'use client';

import { ROUTES } from '@/constants/routes';

import { useMeetings } from '@/hooks/useMeetings';
import WelcomeSection from '@/components/common/welcome-section';
import { ConsultantMeetings, ConsultantStatsCards, ConsultantDashboardSkeleton } from '@/components/dashboard';

export default function ConsultantDashboardPage() {
  const { meetings, isLoading } = useMeetings();

  if (isLoading) {
    return <ConsultantDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection
        subtitle="Here's your teaching overview for today."
        buttonText="Create Service"
        buttonLink={ROUTES.TEACHER.CREATE_SERVICE}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Consultant Stats Cards */}
        <ConsultantStatsCards meetings={meetings} />

        {/* Consultant Sessions */}
        <ConsultantMeetings meetings={meetings} />
      </div>
    </div>
  );
}
