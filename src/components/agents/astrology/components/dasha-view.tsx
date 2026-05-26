'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DashaResponse } from '@/types/astrology';
import { PLANET_META, PLANET_INSIGHTS, DEFAULT_PLANET_INSIGHT } from '@/constants/astrology';
import { getVimshottariSubdivisions, formatDate } from '@/lib/astrology-utils';

import { CosmicWheel } from './cosmic-wheel';
import { MahadashaStrip } from './mahadasha-strip';
import { PeriodsTable } from './periods-table';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMeta(planet: string) {
  return PLANET_META[planet] ?? { symbol: '★', color: '#f97316', border: 'border-primary-500/60', glow: '0 0 14px rgba(249,115,22,0.4)' };
}

function getInsight(planet: string) {
  return PLANET_INSIGHTS[planet] ?? DEFAULT_PLANET_INSIGHT;
}

// ─── Section header (matches image uppercase label style) ─────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-primary-400/80 md:text-xs">
      {children}
    </p>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface DashaViewProps {
  data: DashaResponse;
  className?: string;
}

export function DashaView({ data, className }: DashaViewProps) {
  const { current_period, current_antardashas, mahadasha_sequence } = data;

  // 1. Resolve Active Mahadasha dates
  const activeMahaName = current_period.mahadasha;
  const mahaMeta = getMeta(activeMahaName);

  const currentMahaItem = useMemo(() => {
    return mahadasha_sequence.find(m => m.planet === activeMahaName) || {
      planet: activeMahaName,
      start_date: new Date(new Date(current_period.mahadasha_end).getTime() - 120 * 365 * 24 * 3600 * 1000).toISOString(),
      end_date: current_period.mahadasha_end,
      is_current: true
    };
  }, [mahadasha_sequence, activeMahaName, current_period.mahadasha_end]);

  const mahaPercent = useMemo(() => {
    const start = new Date(currentMahaItem.start_date).getTime();
    const end = new Date(currentMahaItem.end_date).getTime();
    const total = end - start;
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, ((Date.now() - start) / total) * 100));
  }, [currentMahaItem]);

  // 2. Resolve Active Antardasha dates
  const currentAntarItem = useMemo(() => {
    return current_antardashas.find(a => a.is_current) || current_antardashas[0] || {
      planet: current_period.antardasha,
      start_date: new Date(new Date(current_period.antardasha_end).getTime() - 3 * 365 * 24 * 3600 * 1000).toISOString(),
      end_date: current_period.antardasha_end,
      is_current: true
    };
  }, [current_antardashas, current_period.antardasha, current_period.antardasha_end]);

  // 3. Mathematical Subdivision for Pratyantardasha (Under Current Antardasha)
  const pratyantardashas = useMemo(() => {
    return getVimshottariSubdivisions(
      currentAntarItem.start_date,
      currentAntarItem.end_date,
      currentAntarItem.planet
    );
  }, [currentAntarItem]);

  const currentPratyantarItem = useMemo(() => {
    return pratyantardashas.find(p => p.is_current) || pratyantardashas[0] || {
      planet: 'Venus',
      start_date: currentAntarItem.start_date,
      end_date: currentAntarItem.end_date,
      is_current: true
    };
  }, [pratyantardashas, currentAntarItem]);

  // 4. Mathematical Subdivision for Sukshma (Under Current Pratyantardasha)
  const sukshmas = useMemo(() => {
    return getVimshottariSubdivisions(
      currentPratyantarItem.start_date,
      currentPratyantarItem.end_date,
      currentPratyantarItem.planet
    );
  }, [currentPratyantarItem]);

  const currentSukshmaItem = useMemo(() => {
    return sukshmas.find(s => s.is_current) || sukshmas[0] || {
      planet: 'Sun',
      start_date: currentPratyantarItem.start_date,
      end_date: currentPratyantarItem.end_date,
      is_current: true
    };
  }, [sukshmas, currentPratyantarItem]);

  const activeInsight = useMemo(() => getInsight(activeMahaName), [activeMahaName]);

  // Pre-compute sub-period card metadata once (avoids 3× getMeta() calls per render)
  const antarMeta = useMemo(() => getMeta(currentAntarItem.planet), [currentAntarItem.planet]);
  const pratyantarMeta = useMemo(() => getMeta(currentPratyantarItem.planet), [currentPratyantarItem.planet]);
  const sukshMeta = useMemo(() => getMeta(currentSukshmaItem.planet), [currentSukshmaItem.planet]);

  return (
    <div className={cn('flex flex-col gap-8 w-full min-w-0', className)}>

      {/* ─── Dual-Column Responsive Dashboard Layout ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full min-w-0">

        {/* LEFT COLUMN: Charts, Timeline, Sequences */}
        <div className="lg:col-span-2 flex flex-col gap-8 w-full min-w-0">

          {/* 1. Main Current Mahadasha Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[24px] border bg-white/5 px-6 py-6 md:rounded-[2rem] md:px-8 md:py-8 shadow-2xl"
            style={{
              borderColor: `${mahaMeta.color}35`,
              boxShadow: `0 0 40px ${mahaMeta.color}0a, inset 0 0 30px ${mahaMeta.color}08`,
            }}
          >
            {/* Glowing orb accent */}
            <div
              className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[80px] pointer-events-none"
              style={{ background: `${mahaMeta.color}25` }}
            />

            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              {/* Gold Ring Circle with Symbol */}
              <div
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border bg-white/5 relative"
                style={{
                  borderColor: '#d4af37',
                  boxShadow: '0 0 25px rgba(212, 175, 55, 0.25)',
                }}
              >
                <span className="text-4xl leading-none" style={{ color: '#d4af37', textShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}>
                  {mahaMeta.symbol}
                </span>
              </div>

              <div className="text-center sm:text-left flex-1 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-400/80">
                  Current Mahadasha
                </p>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-primary-500">
                  {activeMahaName} Mahadasha
                </h1>
                <p className="text-sm font-semibold text-slate-300">
                  {formatDate(currentMahaItem.start_date)} — {formatDate(currentMahaItem.end_date)}
                </p>
              </div>
            </div>

            {/* Glowing Progress Bar */}
            <div className="mt-8 space-y-2 relative z-10">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="tracking-wide">Timeline Progress</span>
                <span className="text-primary-400 font-mono">{mahaPercent.toFixed(1)}% Complete</span>
              </div>
              <div className="h-2 w-full rounded-full bg-primary-500/10 overflow-hidden ring-1 ring-primary-500/20 relative">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #d4af37 0%, #f59e0b 100%)',
                    boxShadow: '0 0 10px #f59e0b',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${mahaPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Started: {formatDate(currentMahaItem.start_date)}</span>
                <span>Ends: {formatDate(currentMahaItem.end_date)}</span>
              </div>
            </div>
          </motion.div>

          {/* 2. Sub-Periods Capsules Row (Antardasha, Pratyantardasha, Sukshma) */}
          <div className="grid gap-4 sm:grid-cols-3 animate-in fade-in duration-500">
            {/* Card 1: Antardasha */}
            <div
              className="flex flex-col gap-2 rounded-[24px] border bg-white/5 px-5 py-4 relative shadow-sm"
              style={{ borderColor: `${antarMeta.color}25` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary-400/80">Antardasha</span>
                <span className="text-lg leading-none" style={{ color: antarMeta.color }}>
                  {antarMeta.symbol}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: antarMeta.color }}>
                  {currentAntarItem.planet}
                </h3>
                <p className="text-[10px] text-slate-300 font-medium mt-1 leading-tight">
                  {formatDate(currentAntarItem.start_date)}<br />
                  <span className="text-primary-500 font-bold mx-1">›</span> {formatDate(currentAntarItem.end_date)}
                </p>
              </div>
            </div>

            {/* Card 2: Pratyantardasha */}
            <div
              className="flex flex-col gap-2 rounded-[24px] border bg-white/5 px-5 py-4 relative shadow-sm"
              style={{ borderColor: `${pratyantarMeta.color}25` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary-400/80">Pratyantardasha</span>
                <span className="text-lg leading-none" style={{ color: pratyantarMeta.color }}>
                  {pratyantarMeta.symbol}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: pratyantarMeta.color }}>
                  {currentPratyantarItem.planet}
                </h3>
                <p className="text-[10px] text-slate-300 font-medium mt-1 leading-tight">
                  {formatDate(currentPratyantarItem.start_date)}<br />
                  <span className="text-primary-500 font-bold mx-1">›</span> {formatDate(currentPratyantarItem.end_date)}
                </p>
              </div>
            </div>

            {/* Card 3: Sukshma */}
            <div
              className="flex flex-col gap-2 rounded-[24px] border bg-white/5 px-5 py-4 relative shadow-sm"
              style={{ borderColor: `${sukshMeta.color}25` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary-400/80">Sukshma</span>
                <span className="text-lg leading-none" style={{ color: sukshMeta.color }}>
                  {sukshMeta.symbol}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: sukshMeta.color }}>
                  {currentSukshmaItem.planet}
                </h3>
                <p className="text-[10px] text-slate-300 font-medium mt-1 leading-tight">
                  {formatDate(currentSukshmaItem.start_date)}<br />
                  <span className="text-primary-500 font-bold mx-1">›</span> {formatDate(currentSukshmaItem.end_date)}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Mahadasha Sequence Ribbon Timeline */}
          <section className="w-full">
            <SectionLabel>Mahadasha Sequence (Vimshottari Timeline)</SectionLabel>
            <MahadashaStrip
              sequence={mahadasha_sequence}
              activePlanet={activeMahaName}
            />
          </section>

          {/* 4. Upcoming subperiods table */}
          <section className="w-full">
            <SectionLabel>
              Antardashas in {activeMahaName} Mahadasha
            </SectionLabel>
            <PeriodsTable
              antardashas={current_antardashas}
            />
          </section>

          <p className="text-center text-[10px] font-semibold text-slate-600 tracking-wider">
            All dates & times shown are based on Lahiri Ayanamsa (Tropical representation adjusted).
          </p>

        </div>

        {/* RIGHT COLUMN: Wheel SVG & Details Sidebar */}
        <div className="flex flex-col gap-6 w-full min-w-0">

          {/* 1. Visualizer: Cosmic Wheel SVG */}
          <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-400/80 text-center">
              Dasha Rulership Wheel
            </p>
            <CosmicWheel activePlanet={activeMahaName} />
            <div className="mt-4 flex items-center justify-center gap-2.5 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-400 leading-none">
                Active Lord: {activeMahaName}
              </span>
            </div>
          </div>

          {/* 2. Educational & Practical Insights Panel */}
          <div
            className="rounded-[24px] border bg-white/5 px-6 py-6 relative flex flex-col justify-between min-h-[300px] animate-in fade-in duration-700 shadow-lg"
            style={{
              borderColor: `${mahaMeta.color}25`,
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primary-500/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-primary-400 flex items-center gap-2">
                  About {activeMahaName} Mahadasha
                </h3>
                <div className="h-6 w-6 rounded-full flex items-center justify-center bg-primary-500/10 border border-primary-500/20">
                  <span className="text-xs text-primary-400 font-bold">i</span>
                </div>
              </div>

              {/* Text interpretation */}
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeInsight.about}
              </p>

              {/* Favorable Checklist */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  Favorable For
                </p>
                <ul className="space-y-2 text-xs font-semibold text-slate-200">
                  {activeInsight.favorable.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Challenges Bullet list */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-400">
                  May Bring Challenges
                </p>
                <ul className="space-y-2 text-xs font-semibold text-slate-300">
                  {activeInsight.challenges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <AlertCircle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trigger to AI Astrologer */}
            <div className="pt-6 border-t border-primary-500/10 mt-6">
              <button
                className="w-full flex items-center justify-between rounded-xl bg-primary-500 hover:bg-primary-600 text-primary-950 text-xs font-bold px-4 py-3.5 transition-all duration-300 shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Dispatch custom event to trigger state change internally
                  window.dispatchEvent(new CustomEvent('open-ai-astrologer'));
                  
                  // Backwards compatibility fallback query selector trigger
                  const aiBtn = document.querySelector('[aria-label="Ask AI Astrologer"]') as HTMLButtonElement | null;
                  if (aiBtn) {
                    aiBtn.click();
                  }
                }}
              >
                <span className="tracking-wide">Ask AI Astrologer About Dasha</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function DashaViewSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse w-full">
      {/* Seeker Profile */}
      <div className="h-16 rounded-3xl bg-white/5 border border-white/10" />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="h-44 rounded-3xl bg-white/5 border border-white/10" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-2xl bg-white/5 border border-white/10" />
            <div className="h-24 rounded-2xl bg-white/5 border border-white/10" />
            <div className="h-24 rounded-2xl bg-white/5 border border-white/10" />
          </div>
          <div>
            <div className="mb-4 h-3 w-64 rounded-full bg-white/5" />
            <div className="flex gap-2.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-20 w-20 flex-shrink-0 rounded-2xl bg-white/5 border border-white/10" />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 h-3 w-72 rounded-full bg-white/5" />
            <div className="overflow-hidden rounded-3xl border border-white/10">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-12 border-b border-white/5 bg-white/3" />
              ))}
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="h-80 rounded-3xl bg-white/5 border border-white/10" />
          <div className="h-96 rounded-3xl bg-white/5 border border-white/10" />
        </div>
      </div>
    </div>
  );
}
