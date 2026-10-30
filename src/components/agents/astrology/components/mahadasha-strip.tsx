'use client';

import { memo } from 'react';
import { PLANET_META } from '@/constants/astrology';

import { DashaMahadasha } from '@/types/astrology';
import { formatDate, getDurationYears } from '@/lib/astrology-utils';
import { planetTone } from '@/lib/astrology-navigation';
import { cn } from '@/lib/utils';

interface MahaStripProps {
  sequence: DashaMahadasha[];
  activePlanet: string;
  selectedStart?: string;
  onSelect?: (item: DashaMahadasha) => void;
}

export const MahadashaStrip = memo(function MahadashaStrip({
  sequence,
  activePlanet,
  selectedStart,
  onSelect,
}: MahaStripProps) {
  const now = new Date();
  return (
    <div
      className="min-w-0 overflow-x-auto pb-2"
      tabIndex={0}
      aria-label="Major period sequence"
    >
      <div className="flex min-w-max gap-3 p-1">
        {sequence.map((item) => {
          const isCurrent =
            item.is_current ||
            (item.planet === activePlanet &&
              new Date(item.start_date) <= now &&
              new Date(item.end_date) > now);
          const isPast = !isCurrent && new Date(item.end_date) < now;
          const isSelected = selectedStart === item.start_date;
          return (
            <button
              type="button"
              key={`${item.planet}-${item.start_date}`}
              onClick={() => onSelect?.(item)}
              aria-pressed={isSelected}
              data-tone={planetTone(item.planet)}
              className={cn(
                'obs-tile flex min-w-[168px] flex-col items-start gap-2 p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400',
                isSelected && 'ring-2 ring-primary-400',
                isPast && 'opacity-70'
              )}
            >
              {isCurrent ? (
                <span className="obs-chip" data-tone="gold">
                  Current
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {isPast ? 'Past' : 'Upcoming'}
                </span>
              )}
              <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                <span aria-hidden="true" className="text-primary-400">
                  {PLANET_META[item.planet]?.symbol}
                </span>
                {item.planet}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {formatDate(item.start_date)}
                <br />
                to {formatDate(item.end_date)}
              </span>
              <span className="text-xs text-muted-foreground">
                {getDurationYears(item.start_date, item.end_date)} · Mahadasha
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
