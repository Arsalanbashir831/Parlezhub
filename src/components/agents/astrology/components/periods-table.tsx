'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { DashaAntardasha } from '@/types/astrology';
import { PLANET_META } from '@/constants/astrology';
import { formatDate, getDurationLabel } from '@/lib/astrology-utils';

interface PeriodsTableProps {
  antardashas: DashaAntardasha[];
}

function getMeta(planet: string) {
  return PLANET_META[planet] ?? { symbol: '★', color: '#f97316' };
}

const TABLE_HEADERS = ['Period', 'Type', 'Start Date', 'End Date', 'Duration', 'Lord'];

// Pull `new Date()` outside the component – it's a constant for the lifetime of the render
const NOW = new Date();

interface PeriodsTableRowProps {
  item: DashaAntardasha;
  isPast: boolean;
  idx: number;
}

const PeriodsTableRow = memo(function PeriodsTableRow({
  item,
  isPast,
  idx,
}: PeriodsTableRowProps) {
  const meta = getMeta(item.planet);
  const isCurrent = item.is_current;

  const nameColor = isCurrent ? '#d4af37' : isPast ? '#4b5563' : '#cbd5e1';

  return (
    <tr
      className={cn(
        'border-b border-primary-500/10 hover:bg-primary-500/10 transition-colors',
        isCurrent
          ? 'bg-primary-500/10 font-bold'
          : isPast
            ? 'opacity-40'
            : idx % 2 === 0
              ? 'bg-transparent'
              : 'bg-primary-500/5'
      )}
      style={isCurrent ? { boxShadow: 'inset 3px 0 0 #d4af37' } : undefined}
    >
      {/* Period */}
      <td className="px-5 py-3.5 border-r border-primary-500/10">
        <div className="flex items-center gap-3">
          <span className="text-xl leading-none" style={{ color: meta.color }}>
            {meta.symbol}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wide" style={{ color: nameColor }}>
              {item.planet}
            </span>
            {isCurrent && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-5 py-3.5 border-r border-primary-500/10">
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
            isCurrent
              ? 'bg-primary-500/20 text-primary-300 border-primary-500/30'
              : 'bg-primary-500/5 text-primary-400/80 border-primary-500/10'
          )}
        >
          Antardasha
        </span>
      </td>

      {/* Start Date */}
      <td className="px-5 py-3.5 border-r border-primary-500/10">
        <span className="text-[11px] font-semibold text-slate-300">{formatDate(item.start_date)}</span>
      </td>

      {/* End Date */}
      <td className="px-5 py-3.5 border-r border-primary-500/10">
        <span className="text-[11px] font-semibold text-slate-300">{formatDate(item.end_date)}</span>
      </td>

      {/* Duration */}
      <td className="px-5 py-3.5 border-r border-primary-500/10 text-primary-400">
        <span className="text-[11px] font-bold">
          {getDurationLabel(item.start_date, item.end_date)}
        </span>
      </td>

      {/* Lord */}
      <td className="px-5 py-3.5 text-center">
        <span className="text-xl leading-none opacity-85" style={{ color: meta.color }}>
          {meta.symbol}
        </span>
      </td>
    </tr>
  );
});

export const PeriodsTable = memo(function PeriodsTable({ antardashas }: PeriodsTableProps) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-primary-500/20 bg-white/5 shadow-2xl animate-in fade-in duration-500">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-primary-500/20 bg-primary-900/50">
            {TABLE_HEADERS.map((col) => (
              <th
                key={col}
                className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-primary-300 border-r border-primary-500/20 last:border-r-0"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[11px] font-medium">
          {antardashas.map((item, idx) => {
            const isPast = !item.is_current && new Date(item.end_date) < NOW;
            return (
              <PeriodsTableRow
                key={`${item.planet}-${item.start_date}`}
                item={item}
                isPast={isPast}
                idx={idx}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
