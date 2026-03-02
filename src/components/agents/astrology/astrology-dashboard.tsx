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
  Sparkles,
  Star,
  Tornado,
} from 'lucide-react';

import { DashboardState, TaraType } from '@/types/astrology';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export function AstrologyDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(
    'd1-chart'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#fffdfa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-[#fffdfa] text-slate-900 selection:bg-primary-500/10">
      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
        <AnalysisSidebar
          activeAnalysis={activeAnalysis}
          onSelect={setActiveAnalysis}
          iconMap={ICON_MAP}
        />

        {/* Center Canvas */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1 bg-white/30 backdrop-blur-sm">
            {activeAnalysis === 'd1-chart' || !activeAnalysis ? (
              <div className="flex flex-col gap-10 p-8 duration-1000 animate-in fade-in zoom-in-95">
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

                <div className="relative flex flex-col items-center justify-center gap-16 py-10">
                  <VedicChart className="max-h-[600px] max-w-[600px]" />
                  <div className="mx-auto w-full">
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

        {/* Right Sidebar Menu */}
        <NavigationSidebar
          activeAnalysis={activeAnalysis}
          onSelect={setActiveAnalysis}
          iconMap={ICON_MAP}
        />
      </div>
    </div>
  );
}

export default AstrologyDashboard;
