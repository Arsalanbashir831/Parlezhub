'use client';

import { useSearchParams } from 'next/navigation';
import { Hourglass } from 'lucide-react';

import { useDasha } from '@/hooks/useAstrology';
import {
  EmptyNotice,
  RequestError,
} from '@/components/astrology/ui/observatory-state';
import {
  DashaView,
  DashaViewSkeleton,
} from '@/components/astrology/components/dasha-view';

export default function DashaPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;
  const { data, isLoading, isError, isFetching, refetch } = useDasha(
    true,
    studentId,
    guestId
  );
  // Read the cached shape before the loading branch narrows `data` away.
  const cachedSequence = data?.mahadasha_sequence ?? [];
  const cachedAntardashas = data?.current_antardashas ?? [];

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
      {isLoading && (
        <DashaViewSkeleton
          sequence={cachedSequence}
          antardashas={cachedAntardashas}
        />
      )}
      {isError && !isLoading && (
        <RequestError
          title="Unable to load planetary periods"
          message="Dasha dates come from your birth time and place, so this profile needs complete birth details. Nothing has been changed on your chart."
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      )}
      {data && !isLoading && !isError && (
        <DashaView
          key={`${studentId ?? ''}-${guestId ?? ''}`}
          data={data}
          onRefresh={() => refetch()}
          refreshing={isFetching && !isLoading}
        />
      )}
      {!data && !isLoading && !isError && (
        <EmptyNotice
          title="No planetary periods yet"
          message="The calculation service returned no Dasha data for this profile. Confirm the birth details are complete, then reopen this page."
        />
      )}
    </div>
  );
}
