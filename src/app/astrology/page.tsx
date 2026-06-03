'use client';

import { useSearchParams } from 'next/navigation';
import { useBirthProfile, useNatalChart, useTransits } from '@/hooks/useAstrology';
import AstroHeader from '@/components/agents/astrology/components/astro-header';
import VedicChart from '@/components/agents/astrology/components/vedic-chart';
import AstroDetailsTable from '@/components/agents/astrology/components/astro-details-table';
import BirthProfileForm from '@/components/agents/astrology/components/birth-profile-form';
import TransitDateSelector from '@/components/agents/astrology/components/transit-date-selector';
import ChartTypeSelector from '@/components/agents/astrology/components/chart-type-selector';
import { ASTRO_CHART_TYPES } from '@/constants/astrology';
import { DivisionalChart } from '@/types/astrology';
import DivisionalChartAnalysis from '@/components/agents/astrology/components/divisional-chart-analysis';

export default function AstrologyPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  const chartType = searchParams.get('chart_type') || 'd1';
  const transitDate = searchParams.get('transit_date') || undefined;

  const { data: profile, isLoading: isProfileLoading } = useBirthProfile(studentId, guestId);
  const { data: natalChart, isLoading: isChartLoading } = useNatalChart(true, studentId, guestId);
  const { data: transits, isLoading: isTransitsLoading } = useTransits(chartType === 'd1', studentId, guestId, transitDate);

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

  // Only show a full page loader if chart loading and we do not have natal chart data yet
  if (isChartLoading && !natalChart) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const welcomeMessage = guestId || studentId
    ? `Viewing: ${profile.guest_name || profile.user_name}`
    : `Welcome, ${profile.user_name}`;

  // Resolve active chart type dynamically for infinite scalability
  const activeChartConfig = ASTRO_CHART_TYPES.find((c) => c.id === chartType) || ASTRO_CHART_TYPES[0];
  const chartData = natalChart
    ? (natalChart as unknown as Record<string, DivisionalChart | undefined>)[`${activeChartConfig.id}_chart`]
    : null;
  const chartTitle = activeChartConfig.title.toUpperCase();

  return (
    <div className="flex min-w-0 flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-10 md:p-8">
      <AstroHeader
        username={welcomeMessage}
        moonSign={natalChart?.moon_sign || 'N/A'}
        sunSign={natalChart?.sun_sign || 'N/A'}
        ascendant={natalChart?.ascendant?.rashi || 'N/A'}
        birthNakshatra={natalChart?.nakshatra || 'N/A'}
        nakshatraRuler={
          natalChart?.planets.find(
            (p) => p.nakshatra === natalChart.nakshatra
          )?.nakshatra_lord || 'N/A'
        }
      />

      <div className="relative flex flex-col items-center justify-center gap-12 py-4 md:gap-16 md:py-10">
        <div className="flex flex-wrap items-center justify-center gap-4 -mb-4">
          <ChartTypeSelector />
          {chartType === 'd1' && <TransitDateSelector />}
        </div>

        <div className="flex w-full min-w-0 max-w-full justify-center px-2">
          <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
            {(isChartLoading || (isTransitsLoading && chartType === 'd1') || !natalChart) && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-300">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                  <span className="text-xs font-semibold tracking-wide text-primary-300 animate-pulse">
                    Loading celestial positions...
                  </span>
                </div>
              </div>
            )}
            {natalChart && chartData && (
              <VedicChart
                title={chartTitle}
                natalPlanets={chartData.positions}
                transitPlanets={chartType === 'd1' && transits ? transits.transits : []}
                className="h-auto w-full"
              />
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-full px-2">
          {isChartLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-xs rounded-2xl">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          )}
          {natalChart && chartData && (
            <div className="flex flex-col gap-6 md:gap-10">
              <AstroDetailsTable
                grahaDetails={chartData.graha_details}
                bhavaDetails={chartData.bhava_details}
              />
              <DivisionalChartAnalysis
                chartType={chartType}
                studentId={studentId}
                guestProfileId={guestId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

