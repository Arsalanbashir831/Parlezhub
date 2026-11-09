'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarCheck, LayoutList, PlusCircle, Radio, Search } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useServices } from '@/hooks/useServices';
import { cn } from '@/lib/utils';
import type { Service, ServiceStatus } from '@/types/service';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import {
  buttonStyles,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonBlock,
  StatCard,
} from '@/components/parlezhub/ui';
import { GigRow } from '@/components/parlezhub/gigs/gig-row';

const FILTERS: { label: string; value: ServiceStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Live', value: 'active' },
  { label: 'Paused', value: 'inactive' },
];

/** /parlezhub/gigs — the consultant's language gigs. Never astrology readings. */
export default function MyGigsPage() {
  const router = useRouter();
  const {
    services,
    filteredServices,
    stats,
    filters,
    isLoading,
    error,
    setFilters,
    deleteExistingService,
    toggleServiceStatus,
    refreshServices,
    isProcessing,
  } = useServices({ category: 'language' });
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const createLink = (
    <Link href={ROUTES.PARLEZHUB.CREATE_GIG} className={buttonStyles.primary}>
      <PlusCircle className="h-4 w-4" aria-hidden="true" />
      Create gig
    </Link>
  );

  const confirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteExistingService(deleting.id);
      setDeleting(null);
    } catch {
      // The hook has already shown the error; keep the dialog for a retry.
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = (gig: Service) =>
    void toggleServiceStatus(gig.id, gig.status === 'active' ? 'inactive' : 'active').catch(() => undefined);

  const filtered = Boolean(filters.searchQuery || filters.status);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Language Consultant"
        title="My gigs"
        description="The sessions learners can book with you. Pause a gig to hide it without losing it."
        actions={createLink}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Radio} label="Live" value={stats.activeServices} isLoading={isLoading} />
        <StatCard icon={LayoutList} label="Total gigs" value={stats.totalServices} isLoading={isLoading} />
        <StatCard icon={CalendarCheck} label="Sessions booked" value={stats.totalSessions} isLoading={isLoading} />
      </div>

      {error && services.length === 0 ? (
        <ErrorState title="Your gigs could not be loaded" body="Nothing has changed. Check your connection and try again." onRetry={refreshServices} />
      ) : isLoading ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={LayoutList}
          title="Create your first gig"
          body="A gig is one session with a price and a length. Once it is live, learners can find you and book it."
          action={createLink}
        />
      ) : (
        <section aria-label="Your gigs" className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search gigs</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={filters.searchQuery ?? ''}
                onChange={(event) => setFilters({ searchQuery: event.target.value })}
                placeholder="Search by title or tag"
                className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              />
            </label>
            <div className="flex gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label="Filter by status">
              {FILTERS.map(({ label, value }) => {
                const active = filters.status === value;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilters({ status: value })}
                    className={cn(
                      'h-9 rounded-full px-4 text-sm font-semibold transition-colors',
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              No gig matches this filter.{' '}
              {filtered && (
                <button
                  type="button"
                  className="font-semibold text-primary hover:underline"
                  onClick={() => setFilters({ searchQuery: undefined, status: undefined })}
                >
                  Clear it
                </button>
              )}
            </p>
          ) : (
            filteredServices.map((gig) => (
              <GigRow
                key={gig.id}
                gig={gig}
                disabled={isProcessing}
                onEdit={(target) => router.push(ROUTES.PARLEZHUB.EDIT_GIG(target.id))}
                onToggleStatus={toggleStatus}
                onDelete={setDeleting}
              />
            ))
          )}
        </section>
      )}

      <ConfirmationDialog
        isOpen={Boolean(deleting)}
        onClose={() => {
          if (!isDeleting) setDeleting(null);
        }}
        title="Delete this gig?"
        description={`“${deleting?.title ?? 'This gig'}” will be removed for good. Pausing it instead keeps it for later.`}
        confirmText="Delete gig"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
