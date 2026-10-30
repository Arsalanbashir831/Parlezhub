'use client';

import { useSearchParams } from 'next/navigation';
import { Hourglass } from 'lucide-react';

import { useDasha } from '@/hooks/useAstrology';
import {
  DashaView,
  DashaViewSkeleton,
} from '@/components/agents/astrology/components/dasha-view';

export default function DashaPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;
  const { data, isLoading, isError, refetch } = useDasha(
    true,
    studentId,
    guestId
  );

  return (
    <div className="flex min-w-0 flex-col gap-6 text-foreground">
      <header className="relative space-y-2 overflow-hidden">
        <div className="obs-orbit" aria-hidden="true" />
        <p className="obs-label flex items-center gap-2">
          <Hourglass className="h-4 w-4" /> Planetary periods
        </p>
        <h1 className="obs-title">Dasha Timeline</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Explore the selected birth profile’s major and nested planetary
          periods, with dates from the existing Vimshottari Dasha calculation.
        </p>
      </header>
      {isLoading && <DashaViewSkeleton />}
      {isError && !isLoading && (
        <div role="alert" className="obs-card space-y-3 p-6">
          <h2 className="text-lg font-semibold">
            Unable to load planetary periods
          </h2>
          <p className="text-sm text-muted-foreground">
            Check that this profile has complete birth details, then try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="obs-control px-4"
          >
            Try again
          </button>
        </div>
      )}
      {data && !isLoading && !isError && (
        <DashaView key={`${studentId ?? ''}-${guestId ?? ''}`} data={data} />
      )}
      {!data && !isLoading && !isError && (
        <p className="obs-card p-6 text-sm text-muted-foreground">
          No Dasha data is available for this profile yet.
        </p>
      )}
    </div>
  );
}
