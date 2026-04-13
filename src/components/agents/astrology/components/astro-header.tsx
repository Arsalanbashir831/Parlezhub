'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AstroHeaderProps {
  username: string;
  moonSign: string;
  sunSign: string;
  ascendant: string;
  birthNakshatra: string;
  nakshatraRuler: string;
  insight?: string;
  className?: string;
}

const AstroHeader: React.FC<AstroHeaderProps> = ({
  username,
  moonSign,
  sunSign,
  ascendant,
  birthNakshatra,
  nakshatraRuler,
  insight = 'As the planets align, your spirit stands at a celestial portal of rebirth, perfectly attuned to the primordial echoes of the Divine. Lean into the power of sacred cosmic energy today.',
  className,
}) => {
  return (
    <div
      className={cn('grid w-full grid-cols-1 gap-4 xl:grid-cols-3', className)}
    >
      {/* Welcome & Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative col-span-1 overflow-hidden rounded-[24px] border border-primary-500/20 bg-white/5 p-6 shadow-sm backdrop-blur-md md:rounded-[2rem] md:p-8 xl:col-span-2"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-primary-500 md:text-3xl">
              {username}
            </h1>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-primary-500/30 bg-primary-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-300 hover:bg-primary-500/20 md:text-[11px]">
                Moon: {moonSign}
              </Badge>
              <Badge className="border-primary-500/30 bg-primary-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-300 hover:bg-primary-500/20 md:text-[11px]">
                Sun: {sunSign}
              </Badge>
              <Badge className="border-primary-500/30 bg-primary-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-300 hover:bg-primary-500/20 md:text-[11px]">
                Asc: {ascendant}
              </Badge>
            </div>

            <p className="max-w-2xl font-serif text-xs italic leading-relaxed text-slate-100 opacity-90 md:text-sm">
              &quot;{insight}&quot;
            </p>
          </div>

          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 p-3 shadow-lg shadow-primary-600/20 sm:flex md:h-16 md:w-16 md:p-4">
            {/* Simple Om Character representation in font */}
            <span className="text-2xl font-bold text-primary-950 md:text-3xl">
              ॐ
            </span>
          </div>
        </div>
      </motion.div>

      {/* Birth Nakshatra Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center justify-center space-y-2 rounded-[24px] border border-primary-500/20 bg-white/5 p-6 shadow-sm backdrop-blur-md md:rounded-[2rem] md:p-8"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary-500/70 md:text-[10px]">
          Birth Nakshatra
        </p>
        <h2 className="text-2xl font-bold tracking-tighter text-primary-500 md:text-3xl">
          {birthNakshatra}
        </h2>
        <p className="text-[10px] font-medium text-slate-300 md:text-xs">
          Ruler:{' '}
          <span className="font-bold text-primary-400">{nakshatraRuler}</span>
        </p>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
      </motion.div>
    </div>
  );
};

export default AstroHeader;
