'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AstroHeaderProps {
  username: string;
  moonNakshatra: string;
  tara: string;
  tithi: string;
  birthNakshatra: string;
  nakshatraRuler: string;
  insight?: string;
  className?: string;
}

const AstroHeader: React.FC<AstroHeaderProps> = ({
  username,
  moonNakshatra,
  tara,
  tithi,
  birthNakshatra,
  nakshatraRuler,
  insight = 'As the Moon returns to the hallowed embrace of Shravana, your spirit stands at a celestial portal of rebirth, perfectly attuned to the primordial echoes of the Divine. Lean into the power of sacred listening today.',
  className,
}) => {
  return (
    <div
      className={cn('grid w-full grid-cols-1 gap-4 lg:grid-cols-3', className)}
    >
      {/* Welcome & Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative col-span-1 overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/60 p-8 shadow-sm backdrop-blur-md lg:col-span-2"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {username}
            </h1>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-primary-100 bg-primary-50/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-600 hover:bg-primary-50">
                Moon: {moonNakshatra}
              </Badge>
              <Badge className="border-primary-100 bg-primary-50/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-600 hover:bg-primary-50">
                Tara: {tara}
              </Badge>
              <Badge className="border-primary-100 bg-primary-50/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-600 hover:bg-primary-50">
                Tithi: {tithi}
              </Badge>
            </div>

            <p className="max-w-2xl font-serif text-sm italic leading-relaxed text-slate-600 opacity-90">
              &quot;{insight}&quot;
            </p>
          </div>

          <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 p-4 shadow-lg shadow-primary-600/20 sm:flex">
            {/* Simple Om Character representation in font */}
            <span className="text-3xl font-bold text-white">ॐ</span>
          </div>
        </div>
      </motion.div>

      {/* Birth Nakshatra Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center justify-center space-y-2 rounded-[2rem] border border-slate-200/60 bg-white/60 p-8 shadow-sm backdrop-blur-md"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Birth Nakshatra
        </p>
        <h2 className="text-3xl font-bold tracking-tighter text-primary-500">
          {birthNakshatra}
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Ruler:{' '}
          <span className="font-bold text-slate-700">{nakshatraRuler}</span>
        </p>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
      </motion.div>
    </div>
  );
};

export default AstroHeader;
