'use client';

import { useSearchParams } from 'next/navigation';
import { Hourglass } from 'lucide-react';
import { useDasha } from '@/hooks/useAstrology';
import { DashaView, DashaViewSkeleton } from '@/components/agents/astrology/components/dasha-view';

export default function DashaPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  const { data, isLoading, isError } = useDasha(true, studentId, guestId);

  return (
    <div className="flex min-w-0 flex-col gap-8 p-4 duration-700 animate-in fade-in md:gap-10 md:p-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500/30 md:h-14 md:w-14">
          <Hourglass className="h-6 w-6 text-primary-400 md:h-7 md:w-7" />
        </div>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-primary-500 md:text-3xl">
            Dasha Timeline
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-400 md:text-sm">
            Your planetary rulership periods — the ancient Vimshottari Dasha system reveals how each major and sub-period planet shapes the flow of your life.
          </p>
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {isLoading && <DashaViewSkeleton />}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
            <Hourglass className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <p className="font-serif text-lg font-bold text-red-400">Unable to Load Dasha Data</p>
            <p className="mt-1 text-sm text-slate-500">
              Please ensure your birth profile is set up and try again.
            </p>
          </div>
        </div>
      )}

      {data && !isLoading && (
        <DashaView data={data} />
      )}
    </div>
  );
}
