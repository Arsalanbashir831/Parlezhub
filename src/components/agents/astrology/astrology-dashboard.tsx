'use client';

import { useEffect, useState } from 'react';
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

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import AstroHeader from './astro-header';
import { LEFT_MENU_ITEMS, NAKSHATRAS, RIGHT_MENU_ITEMS } from './constants';
import TransitCard from './transit-card';
import { DashboardState, TaraType } from './types';
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
          <div className="mb-2 flex items-center gap-3 px-2">
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="font-serif text-xl font-bold tracking-tight text-slate-900">
              Astro Insights
            </h2>
          </div>

          <ScrollArea className="-mr-4 flex-1 pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="mb-3 ml-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Analysis & Strength
                </p>
                {LEFT_MENU_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.icon] || Info;
                  const isActive = activeAnalysis === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveAnalysis(item.id)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300',
                        isActive
                          ? 'border border-primary-100 bg-white text-primary-600 shadow-sm'
                          : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-lg p-2 transition-colors',
                          isActive
                            ? 'bg-primary-50 shadow-inner'
                            : 'bg-slate-50 group-hover:bg-slate-100'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Center Canvas */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable Center Content */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-10 p-8">
              {/* Personalized Astro Header (New Layout) */}
              <AstroHeader
                username={dashboardState.username}
                moonNakshatra={
                  NAKSHATRAS.find(
                    (n) => n.index === dashboardState.currentMoonNakshatraIndex
                  )?.name || ''
                }
                tara={dashboardState.tara}
                tithi={dashboardState.tithi}
                birthNakshatra={userNak?.name || ''}
                nakshatraRuler={userNak?.lord || ''}
              />

              {/* Chart Area */}
              <div className="relative flex flex-1 items-center justify-center">
                <VedicChart className="max-h-[600px] max-w-[600px]" />

                {/* Floating Labels */}
                <div className="pointer-events-none absolute inset-0">
                  {/* Add subtle cosmic dust particles or extra SVG elements here if needed */}
                </div>
              </div>

              {/* Extra spacing bottom */}
              <div className="h-10" />
            </div>
          </ScrollArea>
        </main>

        {/* Right Sidebar Menu */}
        <aside className="flex w-80 flex-col gap-6 border-l border-slate-200/60 bg-white/40 p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3 px-2">
            <h2 className="ml-auto font-serif text-xl font-bold tracking-tight text-slate-900">
              Celestial Navigation
            </h2>
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-2 shadow-sm">
              <Compass className="h-5 w-5 text-primary-600" />
            </div>
          </div>

          <ScrollArea className="-ml-4 flex-1 pl-4">
            <div className="space-y-4">
              <p className="mb-3 mr-1 px-2 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Celestial Navigation
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
                        'group cursor-pointer overflow-hidden border-slate-200/60 bg-white/80 transition-all duration-500 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/5',
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

                {/* Transit Card at the bottom of left sidebar */}
                <TransitCard
                  className="mt-4"
                  transits={[
                    { planet: 'Sun', sign: 'Aquarius' },
                    { planet: 'Jupiter', sign: 'Aries' },
                    { planet: 'Saturn', sign: 'Aquarius', retrograde: true },
                  ]}
                />
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Modern Dashboard Footer */}
      <footer className="relative z-20 flex h-14 items-center justify-between border-t border-slate-200/60 bg-white/40 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Live Celestial Feed
          </div>
          <span>Refreshed: 32 mins ago</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Add any secondary footer buttons here if needed */}
          <p className="text-[10px] font-medium text-slate-400">
            &copy; 2026 ParlezHub Astrology Engine
          </p>
        </div>
      </footer>

      {/* Dynamic Background (Moved here to stay behind footer content) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-[600px] w-[600px] rounded-full bg-primary-100/50 blur-[100px]" />
        <div className="absolute -left-32 top-1/2 h-[400px] w-[400px] rounded-full bg-orange-50 blur-[80px]" />
        <div className="absolute -bottom-24 right-1/4 h-[300px] w-[300px] rounded-full bg-yellow-50/50 blur-[100px]" />
      </div>
    </div>
  );
}
