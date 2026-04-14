'use client';

import { SESSION_DURATION } from '@/constants/ai-session';
import { Timer } from 'lucide-react';

import { formatTime, getProgressPercentage } from '@/lib/ai-session-utils';

interface SessionTimerProps {
  timeRemaining: number;
}

export default function SessionTimer({ timeRemaining }: SessionTimerProps) {
  return (
    <div className="flex items-center gap-4 md:gap-8">
      {/* Timer Container */}
      <div className="group flex items-center gap-3 rounded-2xl border border-primary-500/10 bg-white/[0.03] px-4 py-2 shadow-lg backdrop-blur-md">
        <div className="relative">
          <Timer className="relative z-10 h-4 w-4 text-primary-500 transition-transform group-hover:rotate-12" />
          <div className="absolute -inset-1 rounded-full bg-primary-500/20 opacity-0 blur-[2px] transition-opacity group-hover:opacity-100" />
        </div>
        <span className="font-serif text-lg font-bold tracking-widest text-primary-100">
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Archival Progress Container */}
      <div className="relative w-24 pt-1 md:w-48">
        <div className="mb-1 flex items-end justify-between">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-100/20">
            Session Lineage
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full border border-white/5 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary-500/50 to-primary-500 shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-1000"
            style={{
              width: `${getProgressPercentage(timeRemaining, SESSION_DURATION)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
