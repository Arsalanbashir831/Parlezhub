'use client';

import { useEffect, useState } from 'react';
import { NAKSHATRAS } from '@/constants/astrology';
import {
  CloudMoon,
  Compass,
  Contrast,
  Crown,
  FileText,
  Flame,
  Gem,
  Info,
  Landmark,
  LifeBuoy,
  Menu,
  Moon,
  Orbit,
  Sparkles,
  Star,
  Tornado,
} from 'lucide-react';

import { DashboardState, TaraType } from '@/types/astrology';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import AnalysisView from './analysis/analysis-view';
import { ANALYSIS_TOPICS } from './analysis/content';
import AstroDetailsTable from './components/astro-details-table';
import AstroHeader from './components/astro-header';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (id: string) => {
    setActiveAnalysis(id);
    setLeftOpen(false);
    setRightOpen(false);
  };

  // Mock data for demo
  const [dashboardState] = useState<DashboardState>({
    userNakshatraIndex: 12, // Uttara Phalguni
    currentMoonNakshatraIndex: 1, // Ashwini
    username: 'Max',
    tara: TaraType.VADHA,
    tithi: 'Shukla Navami',
  });

  const userNak = NAKSHATRAS.find(
    (n) => n.index === dashboardState.userNakshatraIndex
  );

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fffdfa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#fffdfa] text-slate-900 selection:bg-primary-500/10">
      {/* Mobile Navigation Header */}
      <div className="flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/40 px-4 backdrop-blur-md lg:hidden">
        <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 border-none p-0">
            <SheetTitle className="sr-only">Analysis Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Access astrological analysis and planet strengths.
            </SheetDescription>
            <AnalysisSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
            />
          </SheetContent>
        </Sheet>

        <h2 className="font-serif text-lg font-bold text-slate-900">
          Astrology Hub
        </h2>

        <Sheet open={rightOpen} onOpenChange={setRightOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Info className="h-6 w-6 text-slate-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 border-none p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate through charts and transit details.
            </SheetDescription>
            <NavigationSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu (Desktop) */}
        <div className="hidden lg:block">
          <AnalysisSidebar
            activeAnalysis={activeAnalysis}
            onSelect={handleSelect}
            iconMap={ICON_MAP}
            className="w-80 border-r border-slate-200/60 bg-white/40 backdrop-blur-xl"
          />
        </div>

        {/* Center Canvas */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1 bg-white/30 backdrop-blur-sm">
            {activeAnalysis === 'd1-chart' || !activeAnalysis ? (
              <div className="flex flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-10 md:p-8">
                <AstroHeader
                  username={dashboardState.username}
                  moonNakshatra={
                    NAKSHATRAS.find(
                      (n) =>
                        n.index === dashboardState.currentMoonNakshatraIndex
                    )?.name || ''
                  }
                  tara={dashboardState.tara}
                  tithi={dashboardState.tithi}
                  birthNakshatra={userNak?.name || ''}
                  nakshatraRuler={userNak?.lord || ''}
                />

                <div className="relative flex flex-col items-center justify-center gap-12 py-4 md:gap-16 md:py-10">
                  <div className="w-full max-w-[600px] px-2">
                    <VedicChart className="h-auto max-h-[600px] w-full" />
                  </div>
                  <div className="mx-auto w-full px-2">
                    <AstroDetailsTable />
                  </div>
                </div>
              </div>
            ) : (
              <AnalysisView
                topic={
                  ANALYSIS_TOPICS[activeAnalysis] ||
                  ANALYSIS_TOPICS['benefic-planets']
                }
                onBack={() => setActiveAnalysis('d1-chart')}
              />
            )}
          </ScrollArea>
        </main>

        {/* Right Sidebar Menu (Desktop) */}
        <div className="hidden lg:block">
          <NavigationSidebar
            activeAnalysis={activeAnalysis}
            onSelect={handleSelect}
            iconMap={ICON_MAP}
            className="w-80 border-l border-slate-200/60 bg-white/40 backdrop-blur-xl"
          />
        </div>
      </div>
    </div>
  );
}
