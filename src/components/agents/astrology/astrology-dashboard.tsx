'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { LEFT_MENU_ITEMS, NAKSHATRAS, RIGHT_MENU_ITEMS } from './constants';
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
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(
    'd1-chart'
  );

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

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#020617] text-slate-200 selection:bg-primary-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
        <aside className="flex w-80 flex-col gap-6 border-r border-white/5 bg-slate-950/40 p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3 px-2">
            <div className="rounded-xl border border-primary-500/30 bg-primary-500/20 p-2">
              <Sparkles className="h-5 w-5 text-primary-400" />
            </div>
            <h2 className="font-serif text-xl font-bold tracking-tight text-white">
              Astro Insights
            </h2>
          </div>

          <ScrollArea className="-mr-4 flex-1 pr-4">
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
                        ? 'border border-primary-500/20 bg-primary-500/10 text-primary-400 shadow-lg shadow-primary-500/5'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-lg p-2 transition-colors',
                        isActive
                          ? 'bg-primary-500/20'
                          : 'bg-slate-900 group-hover:bg-slate-800'
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
          </ScrollArea>
        </aside>

        {/* Center Canvas */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Header Stats */}
          <header className="flex h-20 items-center justify-between border-b border-white/5 bg-slate-950/20 px-8">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500">
                  Birth Star
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold uppercase tracking-tighter text-white">
                    {userNak?.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-primary-500/30 bg-primary-500/5 px-1.5 py-0 text-[9px] uppercase text-primary-400"
                  >
                    Lord: {userNak?.lord}
                  </Badge>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500">
                  Current Tara
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold uppercase tracking-tighter text-white">
                    {dashboardState.tara}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Active Tithi
                </p>
                <p className="text-sm font-medium text-slate-300">
                  {dashboardState.tithi}
                </p>
              </div>
              <div className="rounded-full border border-white/5 bg-slate-900/50 p-2.5">
                <Moon className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
          </header>

          {/* Chart Area */}
          <div className="relative flex flex-1 items-center justify-center p-8">
            <VedicChart className="max-h-[85%] max-w-[85%]" />

            {/* Floating Labels */}
            <div className="pointer-events-none absolute inset-0">
              {/* Add subtle cosmic dust particles or extra SVG elements here if needed */}
            </div>
          </div>
        </main>

        {/* Right Sidebar Menu */}
        <aside className="flex w-80 flex-col gap-6 border-l border-white/5 bg-slate-950/40 p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3 px-2">
            <h2 className="ml-auto font-serif text-xl font-bold tracking-tight text-white">
              Celestial Navigation
            </h2>
            <div className="rounded-xl border border-primary-500/30 bg-primary-500/20 p-2">
              <Compass className="h-5 w-5 text-primary-400" />
            </div>
          </div>

          <ScrollArea className="-ml-4 flex-1 pl-4">
            <div className="space-y-4">
              <p className="mb-3 mr-1 px-2 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Current Transits
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
                        'group cursor-pointer overflow-hidden border-white/5 bg-slate-900/30 transition-all duration-500 hover:border-primary-500/30',
                        isActive && 'border-primary-500/50 bg-primary-500/5'
                      )}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className={cn(
                            'rounded-xl p-2.5 transition-all duration-500',
                            isActive
                              ? 'scale-110 bg-primary-500/20'
                              : 'bg-slate-950 group-hover:scale-105'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              isActive
                                ? 'text-primary-400'
                                : 'text-slate-500 group-hover:text-primary-300'
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold tracking-tight',
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        >
                          {item.label}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Bottom Info Section */}
              <div className="group relative mt-4 overflow-hidden rounded-3xl border border-primary-500/10 bg-gradient-to-br from-primary-900/40 to-indigo-900/20 p-6">
                <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform duration-1000 group-hover:scale-150">
                  <Star className="h-12 w-12" />
                </div>
                <h4 className="relative z-10 mb-2 text-sm font-bold text-primary-200">
                  Astrological Period
                </h4>
                <p className="relative z-10 text-xs leading-relaxed text-primary-100 opacity-70">
                  You are currently in a transition period favoring learning and
                  spiritual growth. The D1 chart shows strong benefic influence
                  in your 9th house.
                </p>
                <Button
                  variant="link"
                  className="relative z-10 mt-4 h-auto p-0 text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300"
                >
                  Detailed Report <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
