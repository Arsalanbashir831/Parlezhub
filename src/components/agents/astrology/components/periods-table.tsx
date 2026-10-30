'use client';

import { memo } from 'react';
import { PLANET_META } from '@/constants/astrology';

import { DashaAntardasha } from '@/types/astrology';
import { formatDate, getDurationLabel } from '@/lib/astrology-utils';
import { planetTone } from '@/lib/astrology-navigation';
import { cn } from '@/lib/utils';

interface PeriodsTableProps {
  antardashas: DashaAntardasha[];
  selected?: { planet: string; start_date?: string };
  onSelect?: (item: DashaAntardasha) => void;
}

export const PeriodsTable = memo(function PeriodsTable({
  antardashas,
  selected,
  onSelect,
}: PeriodsTableProps) {
  const now = new Date();
  return (
    <div
      className="obs-card min-w-0 overflow-x-auto"
      tabIndex={0}
      aria-label="Sub-period dates"
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Antardasha start dates, end dates, duration, and current status
        </caption>
        <thead className="border-b border-border text-muted-foreground">
          <tr>
            {[
              'Period',
              'Status',
              'Start date',
              'End date',
              'Duration',
              'Details',
            ].map((col) => (
              <th key={col} scope="col" className="px-4 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {antardashas.map((item) => {
            const isPast = !item.is_current && new Date(item.end_date) < now;
            const isSelected =
              selected?.planet === item.planet &&
              selected?.start_date === item.start_date;
            return (
              <tr
                key={`${item.planet}-${item.start_date}`}
                className={cn(
                  'border-b border-border last:border-0 hover:bg-muted/30',
                  isSelected && 'bg-primary-500/5'
                )}
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-semibold text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="text-primary-400"
                    >
                      {PLANET_META[item.planet]?.symbol}
                    </span>
                    {item.planet}
                  </span>
                </th>
                <td className="px-4 py-3">
                  {item.is_current ? (
                    <span className="obs-chip" data-tone={planetTone(item.planet)}>
                      Current
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {isPast ? 'Past' : 'Upcoming'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(item.start_date)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(item.end_date)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {getDurationLabel(item.start_date, item.end_date)}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    className="obs-control px-3 text-sm"
                    onClick={() => onSelect?.(item)}
                    aria-label={`Explain ${item.planet} Antardasha`}
                  >
                    Explain
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
