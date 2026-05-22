'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DashaAntardasha, DashaMahadasha, DashaResponse } from '@/types/astrology';

// ─── Planet metadata ─────────────────────────────────────────────────────────

const PLANET_META: Record<string, { symbol: string; color: string; border: string; glow: string }> = {
  Sun:     { symbol: '☉', color: '#f59e0b', border: 'border-amber-500/60',   glow: '0 0 14px rgba(245,158,11,0.4)' },
  Moon:    { symbol: '☽', color: '#e2e8f0', border: 'border-slate-300/60',   glow: '0 0 14px rgba(226,232,240,0.3)' },
  Mars:    { symbol: '♂',  color: '#ef4444', border: 'border-red-500/60',     glow: '0 0 14px rgba(239,68,68,0.4)' },
  Mercury: { symbol: '☿', color: '#10b981', border: 'border-emerald-500/60', glow: '0 0 14px rgba(16,185,129,0.4)' },
  Jupiter: { symbol: '♃', color: '#eab308', border: 'border-yellow-500/60',  glow: '0 0 14px rgba(234,179,8,0.4)' },
  Venus:   { symbol: '♀',  color: '#ec4899', border: 'border-pink-500/60',    glow: '0 0 14px rgba(236,72,153,0.4)' },
  Saturn:  { symbol: '♄', color: '#a78bfa', border: 'border-violet-400/60',  glow: '0 0 14px rgba(167,139,250,0.4)' },
  Rahu:    { symbol: '☊', color: '#8b5cf6', border: 'border-purple-500/60',  glow: '0 0 14px rgba(139,92,246,0.5)' },
  Ketu:    { symbol: '☋', color: '#f97316', border: 'border-orange-500/60',  glow: '0 0 14px rgba(249,115,22,0.4)' },
};

const DEFAULT_META = { symbol: '★', color: '#f97316', border: 'border-primary-500/60', glow: '0 0 14px rgba(249,115,22,0.4)' };

function getMeta(planet: string) {
  return PLANET_META[planet] ?? DEFAULT_META;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return dateStr; }
}

function getDurationLabel(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const remaining = totalDays - years * 365;
    const months = Math.floor(remaining / 30);
    const days = remaining - months * 30;
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'Yr' : 'Yrs'}`);
    if (months > 0) parts.push(`${months} Mo`);
    if (days > 0 && years === 0) parts.push(`${days} Days`);
    return parts.join(' ') || '< 1 Mo';
  } catch { return '—'; }
}

function getDurationYears(startDate: string, endDate: string): string {
  try {
    const totalDays = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const years = Math.round(totalDays / 365);
    return `${years} Yrs`;
  } catch { return '—'; }
}

// ─── Section header (matches image uppercase label style) ─────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-primary-400/80 md:text-xs">
      {children}
    </p>
  );
}

// ─── Mahadasha Sequence Strip ─────────────────────────────────────────────────

interface MahaStripProps {
  sequence: DashaMahadasha[];
}

function MahadashaStrip({ sequence }: MahaStripProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-1 min-w-max">
        {sequence.map((item, i) => {
          const meta = getMeta(item.planet);
          const isCurrent = item.is_current;
          const isPast = !item.is_current && new Date(item.end_date) < new Date();

          return (
            <motion.div
              key={`${item.planet}-${i}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative"
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 min-w-[72px] transition-all duration-300',
                  isCurrent
                    ? `bg-black/40 backdrop-blur-md`
                    : isPast
                      ? 'border-white/5 bg-white/3 opacity-40'
                      : 'border-white/8 bg-white/5 hover:bg-white/8'
                )}
                style={isCurrent ? {
                  borderColor: meta.color,
                  boxShadow: meta.glow,
                } : {
                  borderColor: isPast ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {/* Symbol */}
                <span
                  className="text-2xl leading-none"
                  style={{ color: isCurrent ? meta.color : isPast ? '#4b5563' : meta.color + 'aa' }}
                >
                  {meta.symbol}
                </span>

                {/* Planet name */}
                <span
                  className="text-[11px] font-semibold leading-none"
                  style={{ color: isCurrent ? meta.color : isPast ? '#4b5563' : '#94a3b8' }}
                >
                  {item.planet}
                </span>

                {/* Duration */}
                <span
                  className="text-[10px] leading-none"
                  style={{ color: isCurrent ? meta.color + 'cc' : '#374151' }}
                >
                  {getDurationYears(item.start_date, item.end_date)}
                </span>
              </div>

              {/* Current indicator diamond */}
              {isCurrent && (
                <div
                  className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45"
                  style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
                />
              )}

              {/* Separator dot between items */}
              {i < sequence.length - 1 && (
                <div className="pointer-events-none absolute -right-1 top-1/2 -translate-y-1/2 text-[8px] text-slate-700">
                  ·
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Periods Table ────────────────────────────────────────────────────────────

interface PeriodsTableProps {
  antardashas: DashaAntardasha[];
}

function PeriodsTable({ antardashas }: PeriodsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-white/8">
            {['Period', 'Type', 'Start Date', 'End Date', 'Duration', 'Lord'].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 md:text-[11px]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {antardashas.map((item, i) => {
            const meta = getMeta(item.planet);
            const isCurrent = item.is_current;
            const isPast = !isCurrent && new Date(item.end_date) < new Date();

            return (
              <motion.tr
                key={`${item.planet}-${item.start_date}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 + 0.1 }}
                className={cn(
                  'border-b border-white/5 transition-colors duration-200',
                  isCurrent
                    ? 'bg-white/5'
                    : isPast
                      ? 'opacity-40'
                      : 'hover:bg-white/3'
                )}
                style={isCurrent ? {
                  boxShadow: `inset 3px 0 0 ${meta.color}`,
                } : undefined}
              >
                {/* Period (planet + symbol) */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none" style={{ color: meta.color }}>
                      {meta.symbol}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isCurrent ? meta.color : isPast ? '#4b5563' : meta.color + 'cc' }}
                      >
                        {item.planet}
                      </span>
                      {isCurrent && (
                        <span
                          className="h-1.5 w-1.5 animate-pulse rounded-full"
                          style={{ background: meta.color }}
                        />
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-400">Antardasha</span>
                </td>

                {/* Start Date */}
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-300">{formatDate(item.start_date)}</span>
                </td>

                {/* End Date */}
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-300">{formatDate(item.end_date)}</span>
                </td>

                {/* Duration */}
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-400">{getDurationLabel(item.start_date, item.end_date)}</span>
                </td>

                {/* Lord (symbol) */}
                <td className="px-4 py-3.5">
                  <span className="text-lg leading-none" style={{ color: meta.color + 'aa' }}>
                    {meta.symbol}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Current Period Callout ───────────────────────────────────────────────────

interface CurrentPeriodBannerProps {
  mahadasha: string;
  mahaEnd: string;
  antardasha: string;
  antarEnd: string;
}

function CurrentPeriodBanner({ mahadasha, mahaEnd, antardasha, antarEnd }: CurrentPeriodBannerProps) {
  const mahaMeta = getMeta(mahadasha);
  const antarMeta = getMeta(antardasha);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {/* Mahadasha */}
      <div
        className="flex items-center gap-4 rounded-2xl border bg-black/30 px-5 py-4 backdrop-blur-md"
        style={{ borderColor: mahaMeta.color + '60', boxShadow: `inset 0 0 30px ${mahaMeta.color}0d` }}
      >
        <span className="text-4xl leading-none" style={{ color: mahaMeta.color, textShadow: mahaMeta.glow }}>
          {mahaMeta.symbol}
        </span>
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Mahadasha
          </p>
          <p className="font-serif text-xl font-bold" style={{ color: mahaMeta.color }}>
            {mahadasha}
          </p>
          <p className="text-[10px] text-slate-500">Ends {formatDate(mahaEnd)}</p>
        </div>
      </div>

      {/* Antardasha */}
      <div
        className="flex items-center gap-4 rounded-2xl border bg-black/30 px-5 py-4 backdrop-blur-md"
        style={{ borderColor: antarMeta.color + '60', boxShadow: `inset 0 0 30px ${antarMeta.color}0d` }}
      >
        <span className="text-4xl leading-none" style={{ color: antarMeta.color, textShadow: antarMeta.glow }}>
          {antarMeta.symbol}
        </span>
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Antardasha
          </p>
          <p className="font-serif text-xl font-bold" style={{ color: antarMeta.color }}>
            {antardasha}
          </p>
          <p className="text-[10px] text-slate-500">Ends {formatDate(antarEnd)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface DashaViewProps {
  data: DashaResponse;
  className?: string;
}

export function DashaView({ data, className }: DashaViewProps) {
  const { current_period, current_antardashas, mahadasha_sequence } = data;

  return (
    <div className={cn('flex min-w-0 flex-col gap-8', className)}>

      {/* Current period summary */}
      <CurrentPeriodBanner
        mahadasha={current_period.mahadasha}
        mahaEnd={current_period.mahadasha_end}
        antardasha={current_period.antardasha}
        antarEnd={current_period.antardasha_end}
      />

      {/* Mahadasha sequence strip */}
      <section>
        <SectionLabel>Mahadasha Sequence (Vimshottari Dasha)</SectionLabel>
        <MahadashaStrip
          sequence={mahadasha_sequence}
        />
      </section>

      {/* Antardasha periods table */}
      <section>
        <SectionLabel>
          Antardashas in {current_period.mahadasha} Mahadasha
        </SectionLabel>
        <PeriodsTable
          antardashas={current_antardashas}
        />
      </section>

    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function DashaViewSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* current period */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
      </div>
      {/* strip */}
      <div>
        <div className="mb-4 h-3 w-64 rounded-full bg-white/5" />
        <div className="flex gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-20 w-20 flex-shrink-0 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
      {/* table */}
      <div>
        <div className="mb-4 h-3 w-72 rounded-full bg-white/5" />
        <div className="overflow-hidden rounded-2xl border border-white/8">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-12 border-b border-white/5 bg-white/3" />
          ))}
        </div>
      </div>
    </div>
  );
}
