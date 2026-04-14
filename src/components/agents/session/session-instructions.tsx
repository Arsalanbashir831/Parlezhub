'use client';

import { Timer, Volume2 } from 'lucide-react';

export default function SessionInstructions() {
  return (
    <div className="mx-auto mt-20 max-w-5xl px-6 text-center duration-1000 animate-in fade-in slide-in-from-bottom-8">
      <h3 className="mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-primary-100/30">
        How it works
      </h3>
      <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
        <div className="group flex flex-col items-center rounded-3xl border border-primary-500/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:border-primary-500/30 hover:bg-white/[0.08]">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-primary-500 shadow-lg shadow-primary-500/5 transition-transform group-hover:scale-110">
            <Volume2 className="h-7 w-7" />
          </div>
          <p className="text-[11px] font-bold uppercase leading-relaxed tracking-widest text-primary-100/60 transition-colors group-hover:text-primary-300">
            Speak naturally &mdash; the AI perceives continuously
          </p>
        </div>

        <div className="group flex flex-col items-center rounded-3xl border border-primary-500/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:border-primary-500/30 hover:bg-white/[0.08]">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-primary-500 shadow-lg shadow-primary-500/5 transition-transform group-hover:scale-110">
            <div className="h-6 w-6 animate-pulse rounded-lg bg-primary-500" />
          </div>
          <p className="text-[11px] font-bold uppercase leading-relaxed tracking-widest text-primary-100/60 transition-colors group-hover:text-primary-300">
            Fluid Exchange &mdash; conversation flows without barriers
          </p>
        </div>

        <div className="group flex flex-col items-center rounded-3xl border border-primary-500/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:border-primary-500/30 hover:bg-white/[0.08]">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-primary-500 shadow-lg shadow-primary-500/5 transition-transform group-hover:scale-110">
            <Timer className="h-7 w-7" />
          </div>
          <p className="text-[11px] font-bold uppercase leading-relaxed tracking-widest text-primary-100/60 transition-colors group-hover:text-primary-300">
            Archival Cycles &mdash; real-time feedback in every breath
          </p>
        </div>
      </div>
    </div>
  );
}
