'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Brain,
  Briefcase,
  CloudMoon,
  Compass,
  Contrast,
  Crown,
  FileText,
  Flame,
  Gem,
  Handshake,
  Hospital,
  Hourglass,
  Landmark,
  LifeBuoy,
  Moon,
  Orbit,
  Sparkles,
  Star,
  Theater,
  Tornado,
  Users,
} from 'lucide-react';

import {
  useBirthProfile,
  useNatalChart,
  useTransits,
} from '@/hooks/useAstrology';
import { ScrollArea } from '@/components/ui/scroll-area';

import InsightView from './analysis/insight-view';
import ShareAccessView from './analysis/share-access-view';
import AstroDetailsTable from './components/astro-details-table';
import AstroHeader from './components/astro-header';
import BirthProfileForm from './components/birth-profile-form';
import { DashboardHeader } from './components/dashboard-header';
import { FloatingFooter } from './components/floating-footer';
import VedicChart from './components/vedic-chart';
import AnalysisSidebar from './layout/analysis-sidebar';
import NavigationSidebar from './layout/navigation-sidebar';

// Map icons manually since the const only has emoji
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '✨': Sparkles,
  '🪐': Orbit,
  '⭐': Star,
  '🧭': Compass,
  '☸️': LifeBuoy,
  '🌙': Moon,
  '💎': Gem,
  '🔥': Flame,
  '📜': FileText,
  '🌌': CloudMoon,
  '🌀': Tornado,
  '👑': Crown,
  '🏛️': Landmark,
  '☯️': Contrast,
  '🧠': Brain,
  '💼': Briefcase,
  '🏥': Hospital,
  '⏳': Hourglass,
  '👥': Users,
  '🎭': Theater,
  '🤝': Handshake,
};

export default function AstrologyDashboard({
  studentId,
  readOnly = false,
}: {
  studentId?: string;
  readOnly?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(
    'd1-chart'
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // API Hooks
  const { data: profile, isLoading: isProfileLoading } = useBirthProfile();
  const { data: natalChart, isLoading: isChartLoading } = useNatalChart(
    !!profile || !!studentId,
    studentId
  );
  const { data: transits, isLoading: isTransitsLoading } = useTransits(
    !!profile || !!studentId,
    studentId
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (id: string) => {
    setActiveAnalysis(id);
    setLeftOpen(false);
    setRightOpen(false);
  };

  if (!mounted || isProfileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fffdfa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const displayUsername = studentId
    ? natalChart?.birth_profile?.user_name || 'Student'
    : profile?.user_name || 'Seeker';

  const welcomeMessage = studentId
    ? `Viewing: ${displayUsername}`
    : `Welcome, ${displayUsername}`;

  const renderLeftSidebar = () => (
    <AnalysisSidebar
      activeAnalysis={activeAnalysis}
      onSelect={handleSelect}
      iconMap={ICON_MAP}
      readOnly={readOnly}
    />
  );

  const renderRightSidebar = () => (
    <NavigationSidebar
      activeAnalysis={activeAnalysis}
      onSelect={handleSelect}
      iconMap={ICON_MAP}
      transits={transits?.transits}
      readOnly={readOnly}
    />
  );

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#fffdfa] text-slate-900 selection:bg-primary-500/10">
      {readOnly && (
        <div className="sticky top-0 z-[60] flex w-full items-center justify-between gap-4 border-b border-primary-100 bg-primary-50/80 px-4 py-2 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-900 md:text-sm">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary-500" />
            Viewing {displayUsername}&apos;s Chart — Read-Only Mode
          </div>
          <Link
            href={ROUTES.TEACHER.DASHBOARD}
            className="text-right text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 md:text-xs"
          >
            ← Back to Students
          </Link>
        </div>
      )}
      <DashboardHeader />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
        {(profile || studentId) && (
          <div className="hidden duration-300 animate-in slide-in-from-left-full xl:block">
            <AnalysisSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              readOnly={readOnly}
              className="w-64 border-r border-slate-200/60 bg-white/40 backdrop-blur-xl xl:w-72 2xl:w-80"
            />
          </div>
        )}

        {/* Center Canvas */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="h-full flex-1 bg-white/30 backdrop-blur-sm">
            {!profile && !studentId ? (
              <BirthProfileForm />
            ) : isChartLoading || isTransitsLoading || !natalChart ? (
              <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
              </div>
            ) : activeAnalysis === 'birth-profile' ? (
              <div className="flex h-full w-full items-center justify-center">
                {readOnly ? (
                  <BirthProfileForm readOnly={true} studentId={studentId} />
                ) : (
                  <BirthProfileForm />
                )}
              </div>
            ) : // Active Analysis checks
            activeAnalysis === 'd1-chart' ||
              activeAnalysis === 'd9-chart' ||
              !activeAnalysis ? (
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
                        title={
                          activeAnalysis === 'd9-chart'
                            ? 'D9 NAVAMSA'
                            : 'D1 CHART'
                        }
                        natalPlanets={
                          activeAnalysis === 'd9-chart'
                            ? natalChart.d9_chart?.positions
                            : natalChart.d1_chart?.positions
                        }
                        transitPlanets={
                          activeAnalysis === 'd1-chart' && transits
                            ? transits.transits
                            : []
                        }
                        className="h-auto w-full"
                      />
                    </div>
                  </div>
                  <div className="mx-auto w-full min-w-0 max-w-full px-2">
                    <AstroDetailsTable
                      grahaDetails={
                        activeAnalysis === 'd9-chart'
                          ? natalChart.d9_chart?.graha_details
                          : natalChart.d1_chart?.graha_details
                      }
                      bhavaDetails={
                        activeAnalysis === 'd9-chart'
                          ? natalChart.d9_chart?.bhava_details
                          : natalChart.d1_chart?.bhava_details
                      }
                    />
                  </div>
                </div>
              </div>
            ) : activeAnalysis === 'share-access' ? (
              readOnly ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="font-serif text-lg text-slate-500">
                    Sharing access is restricted in read-only mode.
                  </p>
                </div>
              ) : (
                <ShareAccessView onBack={() => setActiveAnalysis('d1-chart')} />
              )
            ) : (
              <InsightView
                slug={activeAnalysis}
                onBack={() => setActiveAnalysis('d1-chart')}
                studentId={studentId}
              />
            )}
          </ScrollArea>
        </main>

        {/* Right Sidebar Menu */}
        {(profile || studentId) && (
          <div className="hidden duration-300 animate-in slide-in-from-right-full xl:block">
            <NavigationSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              className="w-64 border-l border-slate-200/60 bg-white/40 backdrop-blur-xl xl:w-72 2xl:w-80"
              transits={transits?.transits}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>

      {/* Mobile Floating Actions */}
      <FloatingFooter
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        rightOpen={rightOpen}
        setRightOpen={setRightOpen}
        renderLeftSidebar={renderLeftSidebar}
        renderRightSidebar={renderRightSidebar}
      />
    </div>
  );
}
