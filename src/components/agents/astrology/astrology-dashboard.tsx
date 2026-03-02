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
  Landmark,
  LifeBuoy,
  Moon,
  Orbit,
  PanelLeftOpen,
  PanelRightOpen,
  Sparkles,
  Star,
  Tornado,
} from 'lucide-react';

import { DashboardState, TaraType } from '@/types/astrology';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [leftDesktopOpen, setLeftDesktopOpen] = useState(true);
  const [rightDesktopOpen, setRightDesktopOpen] = useState(true);

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
      {/* Premium Top Navigation Bar (Consistent across all sizes) */}
      <header className="z-50 flex h-20 w-full items-center justify-between border-b border-black/5 px-4 md:px-8">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Analysis Menu Toggle (Mobile & Desktop) */}
          <div className="flex items-center">
            {/* Mobile Toggle */}
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <SheetTrigger asChild className="lg:hidden">
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
                  Access astrological analysis and planet strengths.
                </SheetDescription>
                <AnalysisSidebar
                  activeAnalysis={activeAnalysis}
                  onSelect={handleSelect}
                  iconMap={ICON_MAP}
                />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col">
            <h1 className="font-serif text-lg font-bold leading-none tracking-[0.1em] text-black md:text-2xl">
              JYOTISH COSMIC
            </h1>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.3em] text-primary-500 md:text-[10px]">
              Vedic Astrology Intelligence
            </p>
          </div>
        </div>

        {/* User Profile & Right Sidebar Toggle */}
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden flex-col items-end leading-tight sm:flex">
            <span className="text-[10px] font-medium text-slate-500">
              Logged in as
            </span>
            <span className="text-sm font-bold text-primary-500">
              {dashboardState.username} Doe
            </span>
          </div>

          <Avatar className="h-9 w-9 border-2 border-primary-500/20 shadow-lg shadow-primary-500/10 md:h-10 md:w-10">
            <AvatarImage src="" />
            <AvatarFallback
              className="bg-primary-600 text-[11px] font-bold text-white"
              title="John Doe"
            >
              JD
            </AvatarFallback>
          </Avatar>

          {/* Navigation Menu Toggle (Mobile & Desktop) */}
          <div className="flex items-center">
            {/* Mobile Toggle */}
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild className="lg:hidden">
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
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu (Desktop Collapsible) */}
        {leftDesktopOpen && (
          <div className="hidden duration-300 animate-in slide-in-from-left-full lg:block">
            <AnalysisSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              className="w-64 border-r border-slate-200/60 bg-white/40 backdrop-blur-xl lg:w-72 2xl:w-80"
            />
          </div>
        )}

        {/* Center Canvas */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1 bg-white/30 backdrop-blur-sm">
            {activeAnalysis === 'd1-chart' || !activeAnalysis ? (
              <div className="flex min-w-0 flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-10 md:p-8">
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

        {/* Right Sidebar Menu (Desktop Collapsible) */}
        {rightDesktopOpen && (
          <div className="hidden duration-300 animate-in slide-in-from-right-full lg:block">
            <NavigationSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              className="w-64 border-l border-slate-200/60 bg-white/40 backdrop-blur-xl lg:w-72 2xl:w-80"
            />
          </div>
        )}
      </div>
    </div>
  );
}
