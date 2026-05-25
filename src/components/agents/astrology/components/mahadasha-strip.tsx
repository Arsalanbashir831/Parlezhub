'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { DashaMahadasha } from '@/types/astrology';
import { PLANET_META } from '@/constants/astrology';
import { getDurationYears } from '@/lib/astrology-utils';

interface MahaStripProps {
  sequence: DashaMahadasha[];
  activePlanet: string;
}

function getMeta(planet: string) {
  return PLANET_META[planet] ?? { symbol: '★', color: '#f97316' };
}

const NOW = new Date();

const MahaStripCard = memo(function MahaStripCard({
  item,
  isCurrent,
  isPast,
}: {
  item: DashaMahadasha;
  isCurrent: boolean;
  isPast: boolean;
}) {
  const meta = getMeta(item.planet);

  return (
    <div className="relative">
      <div
        className={cn(
          'flex flex-col items-center gap-1.5 rounded-[20px] border px-4 py-4 min-w-[85px] transition-all duration-300',
          isCurrent
            ? 'bg-primary-500/10 ring-1 ring-primary-500/20'
            : isPast
              ? 'opacity-40 hover:opacity-60'
              : 'hover:bg-primary-500/5'
        )}
        style={
          isCurrent
            ? { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)', boxShadow: '0 0 20px rgba(212,175,55,0.15)' }
            : { borderColor: isPast ? 'rgba(212,175,55,0.05)' : 'rgba(212,175,55,0.15)', backgroundColor: 'rgba(255,255,255,0.02)' }
        }
      >
        {/* Symbol */}
        <span
          className="text-2xl leading-none font-medium"
          style={{ color: isCurrent ? '#d4af37' : isPast ? '#4b5563' : meta.color }}
        >
          {meta.symbol}
        </span>

        {/* Planet name */}
        <span
          className="text-[11px] font-bold leading-none tracking-wide"
          style={{ color: isCurrent ? '#d4af37' : isPast ? '#4b5563' : '#cbd5e1' }}
        >
          {item.planet}
        </span>

        {/* Duration */}
        <span
          className="text-[10px] leading-none opacity-80"
          style={{ color: isCurrent ? '#d4af37aa' : isPast ? '#374151' : '#94a3b8' }}
        >
          {getDurationYears(item.start_date, item.end_date)}
        </span>
      </div>

      {/* Current indicator diamond */}
      {isCurrent && (
        <div
          className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45"
          style={{ background: '#d4af37' }}
        />
      )}
    </div>
  );
});

export const MahadashaStrip = memo(function MahadashaStrip({
  sequence,
  activePlanet,
}: MahaStripProps) {
  return (
    <div className="overflow-x-auto pb-4 -mx-1 px-1">
      <div className="flex gap-2.5 min-w-max py-2 animate-in fade-in duration-500">
        {sequence.map((item, i) => {
          const isCurrent = item.planet === activePlanet;
          const isPast = !isCurrent && new Date(item.end_date) < NOW;
          return (
            <MahaStripCard key={`${item.planet}-${i}`} item={item} isCurrent={isCurrent} isPast={isPast} />
          );
        })}
      </div>
    </div>
  );
});
