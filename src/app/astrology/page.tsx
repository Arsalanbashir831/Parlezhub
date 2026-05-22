'use client';

import { useSearchParams } from 'next/navigation';
import { useBirthProfile, useNatalChart, useTransits } from '@/hooks/useAstrology';
import AstroHeader from '@/components/agents/astrology/components/astro-header';
import VedicChart from '@/components/agents/astrology/components/vedic-chart';
import AstroDetailsTable from '@/components/agents/astrology/components/astro-details-table';
import BirthProfileForm from '@/components/agents/astrology/components/birth-profile-form';
import TransitDateSelector from '@/components/agents/astrology/components/transit-date-selector';

export default function AstrologyPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  const transitDate = searchParams.get('transit_date') || undefined;
  const { data: profile, isLoading: isProfileLoading } = useBirthProfile(studentId, guestId);
  const { data: natalChart, isLoading: isChartLoading } = useNatalChart(true, studentId, guestId);
  const { data: transits, isLoading: isTransitsLoading } = useTransits(true, studentId, guestId, transitDate);

  if (isProfileLoading) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // If no profile exists, show the birth profile form
  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <BirthProfileForm
          type={guestId ? 'guest' : studentId ? 'student' : 'me'}
          studentId={studentId}
          guestProfileId={guestId}
        />
      </div>
    );
  }

  if (isChartLoading || isTransitsLoading || !natalChart) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const welcomeMessage = guestId || studentId
    ? `Viewing: ${profile.guest_name || profile.user_name}`
    : `Welcome, ${profile.user_name}`;

  return (
    <div className="flex min-w-0 flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-10 md:p-8">
      <AstroHeader
        username={welcomeMessage}
        moonSign={natalChart.moon_sign || 'N/A'}
        sunSign={natalChart.sun_sign || 'N/A'}
        ascendant={natalChart.ascendant?.rashi || 'N/A'}
        birthNakshatra={natalChart.nakshatra || 'N/A'}
        nakshatraRuler={
          natalChart.planets.find(
            (p) => p.nakshatra === natalChart.nakshatra
          )?.nakshatra_lord || 'N/A'
        }
      />

      <div className="relative flex flex-col items-center justify-center gap-12 py-4 md:gap-16 md:py-10">
        <div className="-mb-4">
          <TransitDateSelector />
        </div>

        <div className="flex w-full min-w-0 max-w-full justify-center px-2">
          <div className="w-full max-w-[600px]">
            <VedicChart
              title="D1 CHART"
              natalPlanets={natalChart.d1_chart?.positions}
              transitPlanets={transits?.transits || []}
              className="h-auto w-full"
            />
          </div>
        </div>
        <div className="mx-auto w-full min-w-0 max-w-full px-2">
          <AstroDetailsTable
            grahaDetails={natalChart.d1_chart?.graha_details}
            bhavaDetails={natalChart.d1_chart?.bhava_details}
          />
        </div>
      </div>
    </div>
  );
}
