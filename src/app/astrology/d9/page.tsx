'use client';

import { useSearchParams } from 'next/navigation';
import { useBirthProfile, useNatalChart } from '@/hooks/useAstrology';
import AstroHeader from '@/components/agents/astrology/components/astro-header';
import VedicChart from '@/components/agents/astrology/components/vedic-chart';
import AstroDetailsTable from '@/components/agents/astrology/components/astro-details-table';

export default function NavamsaPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  const { data: profile, isLoading: isProfileLoading } = useBirthProfile(studentId, guestId);
  const { data: natalChart, isLoading: isChartLoading } = useNatalChart(true, studentId, guestId);

  if (isProfileLoading || isChartLoading || !natalChart) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const welcomeMessage = guestId || studentId
    ? `Viewing: ${profile?.guest_name || profile?.user_name}`
    : `Welcome, ${profile?.user_name}`;

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
        <div className="flex w-full min-w-0 max-w-full justify-center px-2">
          <div className="w-full max-w-[600px]">
            <VedicChart
              title="D9 NAVAMSA"
              natalPlanets={natalChart.d9_chart?.positions}
              transitPlanets={[]}
              className="h-auto w-full"
            />
          </div>
        </div>
        <div className="mx-auto w-full min-w-0 max-w-full px-2">
          <AstroDetailsTable
            grahaDetails={natalChart.d9_chart?.graha_details}
            bhavaDetails={natalChart.d9_chart?.bhava_details}
          />
        </div>
      </div>
    </div>
  );
}
