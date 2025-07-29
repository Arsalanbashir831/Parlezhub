'use client';

import { ROUTES } from '@/constants/routes';

import { useMeetings } from '@/hooks/useMeetings';
import WelcomeSection from '@/components/common/welcome-section';
import { TeacherMeetings, TeacherStatsCards } from '@/components/dashboard';

export default function TeacherDashboardPage() {
  const { meetings } = useMeetings();

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
        {/* Teacher Stats Cards */}
        <TeacherStatsCards meetings={meetings} />

        {/* Teacher Sessions */}
        <TeacherMeetings meetings={meetings} />
      </div>
    </div>
  );
}
