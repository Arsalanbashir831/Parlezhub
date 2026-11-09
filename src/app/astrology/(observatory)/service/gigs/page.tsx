'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { Service, ServiceStatus } from '@/types/service';
import { useServices } from '@/hooks/useServices';
import { GigCard } from '@/components/astrology/service/gig-card';
import {
  EmptyNotice,
  LoadingLayout,
  Refreshing,
  RequestError,
  Skeleton,
} from '@/components/astrology/ui/observatory-state';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';

const STATUS_FILTERS: { label: string; value: ServiceStatus | 'all' }[] = [
  { label: 'All gigs', value: 'all' },
  { label: 'Live', value: 'active' },
  { label: 'Paused', value: 'inactive' },
];

function StatTile({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: 'jade' | 'gold' | 'nebula' | 'deep' }) {
  return (
    <div className="obs-tile min-w-0 p-5" data-tone={tone}>
      <p className="obs-label">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}

function GigCardSkeleton() {
  return (
    <div className="obs-card flex min-w-0 flex-col gap-4 p-5 sm:p-6" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-5 w-28" rounded="rounded-md" />
        <Skeleton className="h-7 w-20" rounded="rounded-md" />
      </div>
      <Skeleton className="h-5 w-3/4 max-w-full" rounded="rounded-md" />
      <Skeleton className="h-4 w-2/3 max-w-full" rounded="rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20" rounded="rounded-full" />
        <Skeleton className="h-7 w-24" rounded="rounded-full" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-11 w-24" rounded="rounded-xl" />
        <Skeleton className="h-11 w-20" rounded="rounded-xl" />
        <Skeleton className="ml-auto h-11 w-11" rounded="rounded-xl" />
      </div>
    </div>
  );
}

export default function AstrologerGigsPage() {
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
  } = useServices({ category: 'astrology' });

  const [deleting, setDeleting] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const earnings = useMemo(
    () => stats.totalEarnings.toLocaleString('en-US'),
    [stats.totalEarnings]
  );

  const confirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteExistingService(deleting.id);
      setDeleting(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (service: Service) => {
    setIsSavingStatus(true);
    try {
      await toggleServiceStatus(service.id, service.status === 'active' ? 'inactive' : 'active');
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (error && services.length === 0) {
    return (
      <div className="space-y-7">
        <PageHeader />
        <RequestError
          title="Your gigs could not be loaded"
          message="Nothing about your published gigs has changed. Check your connection and try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-7">
      <PageHeader />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="On your profile" value={String(stats.activeServices)} hint="Gigs students can book right now." tone="jade" />
        <StatTile label="Total gigs" value={String(stats.totalServices)} hint="Including the ones you have paused." tone="gold" />
        <StatTile label="Sessions booked" value={String(stats.totalSessions)} hint="Across every gig you have published." tone="deep" />
        <StatTile label="Earnings to date" value={`$${earnings}`} hint={stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} average rating.` : 'Booked sessions at your listed price.'} tone="nebula" />
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <label className="obs-card obs-search min-w-0 flex-1 basis-64 p-0 text-sm">
          <span className="obs-label">Search</span>
          <input
            value={filters.searchQuery ?? ''}
            onChange={event => setFilters({ searchQuery: event.target.value })}
            placeholder="Title, description or tag…"
            className="w-full min-w-0 bg-transparent text-foreground"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              className="obs-control text-xs"
              aria-pressed={value === 'all' ? !filters.status : filters.status === value}
              onClick={() => setFilters({ status: value === 'all' ? undefined : value })}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="obs-muted text-sm">
            {filteredServices.length} of {services.length} gig{services.length === 1 ? '' : 's'}
          </p>
          {isSavingStatus && <Refreshing label="Saving…" />}
        </div>

        {isLoading && (
          <LoadingLayout label="Loading your gigs…" className="grid gap-4 xl:grid-cols-2">
            <GigCardSkeleton />
            <GigCardSkeleton />
          </LoadingLayout>
        )}

        {!isLoading && filteredServices.length === 0 && (
          <EmptyNotice
            title={filters.searchQuery || filters.status ? 'No gig matches this filter' : 'Your first gig starts here'}
            message={
              filters.searchQuery || filters.status
                ? `Nothing matches “${filters.searchQuery || (filters.status === 'active' ? 'live gigs' : 'paused gigs')}”. Clear the filter above — every gig is still there.`
                : 'One offering, priced and timed. A published gig appears on your profile and its booking card lands in every chat a student opens with you.'
            }
            action={
              filters.searchQuery || filters.status
                ? <button type="button" className="obs-control text-xs" onClick={() => setFilters({ searchQuery: undefined, status: undefined })}>Clear filters</button>
                : <Link href={ROUTES.AGENT.ASTROLOGY.SERVICE.CREATE_GIG} className="obs-button text-xs"><Plus className="h-4 w-4" />Create a gig</Link>
            }
          />
        )}

        {!isLoading && filteredServices.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredServices.map(service => (
              <GigCard
                key={service.id}
                service={service}
                onEdit={service => router.push(ROUTES.AGENT.ASTROLOGY.SERVICE.EDIT_GIG(service.id))}
                onToggleStatus={toggleStatus}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmationDialog
        isOpen={!!deleting}
        onClose={() => { if (!isDeleting) setDeleting(null); }}
        title="Delete this gig?"
        description={`“${deleting?.title || 'This gig'}” and its booking history will be removed. This cannot be undone — pausing it keeps the history.`}
        confirmText="Delete gig"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function PageHeader() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="obs-label mb-3">Astrologer Service</p>
        <h1 className="obs-title">Your gigs</h1>
        <p className="obs-muted mt-3 max-w-xl text-sm">
          Everything you offer, with its sessions and status. Pause a gig and it leaves your profile without losing its history.
        </p>
      </div>
      <Link href={ROUTES.AGENT.ASTROLOGY.SERVICE.CREATE_GIG} className="obs-button shrink-0">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add a gig
      </Link>
    </header>
  );
}
