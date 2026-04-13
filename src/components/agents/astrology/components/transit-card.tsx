'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface TransitCardProps {
  className?: string;
  transits?: { planet: string; sign: string; retrograde?: boolean }[];
}

const TransitCard: React.FC<TransitCardProps> = ({
  className,
  transits = [
    { planet: 'Sun', sign: 'Pisces' },
    { planet: 'Moon', sign: 'Gemini' },
    { planet: 'Mars', sign: 'Aquarius', retrograde: true },
  ],
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-primary-500/60 bg-white/5 p-5 shadow-sm backdrop-blur-md',
        className
      )}
    >
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
        Current Transits
      </p>

      <div className="space-y-3">
        {transits.map((t) => (
          <div
            key={t.planet}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-medium text-primary-500">{t.planet}</span>
            <span className="font-bold text-primary-300">
              {t.sign} {t.retrograde && '(R)'}
            </span>
          </div>
        ))}
      </div>

      {/* <Button className="mt-6 w-full rounded-2xl bg-primary-500 py-6 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] hover:bg-primary-600">
        Refresh Transits
      </Button> */}
    </div>
  );
};

export default TransitCard;
