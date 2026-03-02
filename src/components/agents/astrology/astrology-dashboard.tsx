'use client';

import { useEffect, useState } from 'react';
import {
  LEFT_MENU_ITEMS,
  NAKSHATRAS,
  RIGHT_MENU_ITEMS,
} from '@/constants/astrology';
import { motion } from 'framer-motion';
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
  Moon,
  Orbit,
  Sparkles,
  Star,
  Tornado,
} from 'lucide-react';

import { DashboardState, TaraType } from '@/types/astrology';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import AnalysisView from './analysis/analysis-view';
import { ANALYSIS_TOPICS } from './analysis/content';
import AstroHeader from './astro-header';
import AstroDetailsTable from './dashboard/astro-details-table';
import TransitCard from './transit-card';
import VedicChart from './vedic-chart';

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
        <aside className="flex w-80 flex-col gap-6 border-r border-slate-200/60 bg-white/40 p-6 backdrop-blur-xl">
          <ScrollArea className="-mr-4 flex-1 pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="mb-3 ml-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Analysis & Strength
                </p>
                <div className="grid gap-3">
                  {LEFT_MENU_ITEMS.map((item) => {
                    const Icon = ICON_MAP[item.icon] || Info;
                    const isActive = activeAnalysis === item.id;
                    return (
                      <Card
                        key={item.id}
                        onClick={() => setActiveAnalysis(item.id)}
                        className={cn(
                          'group cursor-pointer gap-0 overflow-hidden border-slate-200/60 bg-white/80 py-0 transition-all duration-500 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/5',
                          isActive &&
                            'border-primary-200 bg-primary-50/50 shadow-sm'
                        )}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <div
                            className={cn(
                              'rounded-xl p-2 transition-all duration-500',
                              isActive
                                ? 'bg-primary-50 shadow-inner'
                                : 'bg-slate-50 group-hover:bg-slate-100'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-4 w-4 transition-colors duration-500',
                                isActive
                                  ? 'text-primary-600'
                                  : 'text-slate-400 group-hover:text-primary-500'
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              'text-sm font-medium transition-colors',
                              isActive ? 'text-primary-600' : 'text-slate-600'
                            )}
                          >
                            {item.label}
                          </span>
                          {isActive && (
                            <motion.div
                              layoutId="active-pill"
                              className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                            />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Center Canvas */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable Center Content */}
          <ScrollArea className="flex-1 bg-white/30 backdrop-blur-sm">
            {activeAnalysis === 'd1-chart' || !activeAnalysis ? (
              <div className="flex flex-col gap-10 p-8 duration-1000 animate-in fade-in zoom-in-95">
                {/* Personalized Astro Header (New Layout) */}
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

                {/* Chart Area */}
                <div className="relative flex flex-col items-center justify-center gap-16 py-10">
                  <VedicChart className="max-h-[600px] max-w-[600px]" />

                  {/* Detailed Astro Tables (NEW) */}
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
        <aside className="flex w-80 flex-col gap-6 border-l border-slate-200/60 bg-white/40 p-6 backdrop-blur-xl">
          <ScrollArea className="-ml-4 flex-1 pl-4">
            <div className="space-y-4">
              <p className="mb-3 mr-1 px-2 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Main Navigation
              </p>

              <div className="grid gap-3">
                {RIGHT_MENU_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.icon] || Info;
                  const isActive = activeAnalysis === item.id;
                  return (
                    <Card
                      key={item.id}
                      onClick={() => setActiveAnalysis(item.id)}
                      className={cn(
                        'group cursor-pointer gap-0 overflow-hidden border-slate-200/60 bg-white/80 py-0 transition-all duration-500 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/5',
                        isActive &&
                          'border-primary-200 bg-primary-50/50 shadow-sm'
                      )}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className={cn(
                            'rounded-xl p-2.5 transition-all duration-500',
                            isActive
                              ? 'scale-110 bg-primary-100 shadow-sm'
                              : 'bg-slate-50 group-hover:scale-105'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              isActive
                                ? 'text-primary-600'
                                : 'text-slate-400 group-hover:text-primary-500'
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold tracking-tight',
                            isActive
                              ? 'text-slate-900'
                              : 'text-slate-500 group-hover:text-slate-900'
                          )}
                        >
                          {item.label}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Transit Card Section (Moved to Right Side as requested) */}
              <TransitCard
                className="mt-4"
                transits={[
                  { planet: 'Sun', sign: 'Aquarius' },
                  { planet: 'Jupiter', sign: 'Aries' },
                  { planet: 'Saturn', sign: 'Aquarius', retrograde: true },
                ]}
              />
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
