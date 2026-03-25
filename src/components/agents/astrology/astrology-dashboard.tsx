'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import {
  CloudMoon,
  Compass,
  Contrast,
  Crown,
  FileText,
  Flame,
  Gem,
  Landmark,
  LifeBuoy,
  LogOut,
  Moon,
  Orbit,
  PanelLeftOpen,
  PanelRightOpen,
  Sparkles,
  Star,
  Tornado,
} from 'lucide-react';

import {
  useBirthProfile,
  useNatalChart,
  useTransits,
} from '@/hooks/useAstrology';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserMiniCard } from '@/components/layout/user-mini-card';

import AnalysisView from './analysis/analysis-view';
import { ANALYSIS_TOPICS } from './analysis/content';
import InsightView from './analysis/insight-view';
import AstroDetailsTable from './components/astro-details-table';
import AstroHeader from './components/astro-header';
import BirthProfileForm from './components/birth-profile-form';
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
};

export default function AstrologyDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(
    'd1-chart'
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // For simplicity, force desktop menus open by default on large screens.
  const [leftDesktopOpen, setLeftDesktopOpen] = useState(true);
  const [rightDesktopOpen, setRightDesktopOpen] = useState(true);

  const { logout } = useAuth();
  const router = useRouter();

  // API Hooks
  const { data: profile, isLoading: isProfileLoading } = useBirthProfile();
  const { data: natalChart, isLoading: isChartLoading } =
    useNatalChart(!!profile);
  const { data: transits, isLoading: isTransitsLoading } =
    useTransits(!!profile);

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

  const username = profile ? profile.user_name || 'Seeker' : 'Guest';

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#fffdfa] text-slate-900 selection:bg-primary-500/10">
      {/* Premium Top Navigation Bar (Consistent across all sizes) */}
      <header className="z-50 flex h-20 w-full items-center justify-between border-b border-black/5 px-4 md:px-8">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center">
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-slate-400 hover:bg-white/10 hover:text-black"
                >
                  <PanelLeftOpen className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-none p-0">
                <SheetTitle className="sr-only">Analysis Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Access astrological analysis.
                </SheetDescription>
                <AnalysisSidebar
                  activeAnalysis={activeAnalysis}
                  onSelect={handleSelect}
                  iconMap={ICON_MAP}
                />
              </SheetContent>
            </Sheet>
          </div>
          <Logo href={ROUTES.HOME} />
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-4">
            <UserMiniCard roleLabel="Astrologer" />
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                logout();
                router.push(ROUTES.AUTH.LOGIN);
              }}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center">
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-slate-400 hover:bg-white/10 hover:text-black"
                >
                  <PanelRightOpen className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-none p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate through charts.
                </SheetDescription>
                <NavigationSidebar
                  activeAnalysis={activeAnalysis}
                  onSelect={handleSelect}
                  iconMap={ICON_MAP}
                  transits={transits?.transits}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
        {leftDesktopOpen && profile && (
          <div className="hidden duration-300 animate-in slide-in-from-left-full xl:block">
            <AnalysisSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              className="w-64 border-r border-slate-200/60 bg-white/40 backdrop-blur-xl xl:w-72 2xl:w-80"
            />
          </div>
        )}

        {/* Center Canvas */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="h-full flex-1 bg-white/30 backdrop-blur-sm">
            {!profile ? (
              <BirthProfileForm />
            ) : isChartLoading || isTransitsLoading || !natalChart ? (
              <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
              </div>
            ) : activeAnalysis === 'birth-profile' ? (
              <div className="flex h-full w-full items-center justify-center">
                <BirthProfileForm />
              </div>
            ) : // Active Analysis checks
            activeAnalysis === 'd1-chart' ||
              activeAnalysis === 'd9-chart' ||
              !activeAnalysis ? (
              <div className="flex min-w-0 flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-10 md:p-8">
                <AstroHeader
                  username={username}
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
            ) : activeAnalysis in ANALYSIS_TOPICS ? (
              <AnalysisView
                topic={
                  ANALYSIS_TOPICS[activeAnalysis] ||
                  ANALYSIS_TOPICS['benefic-planets']
                }
                onBack={() => setActiveAnalysis('d1-chart')}
              />
            ) : (
              <InsightView
                slug={activeAnalysis}
                onBack={() => setActiveAnalysis('d1-chart')}
              />
            )}
          </ScrollArea>
        </main>

        {/* Right Sidebar Menu */}
        {rightDesktopOpen && profile && (
          <div className="hidden duration-300 animate-in slide-in-from-right-full xl:block">
            <NavigationSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              className="w-64 border-l border-slate-200/60 bg-white/40 backdrop-blur-xl xl:w-72 2xl:w-80"
              transits={transits?.transits}
            />
          </div>
        )}
      </div>
    </div>
  );
}
