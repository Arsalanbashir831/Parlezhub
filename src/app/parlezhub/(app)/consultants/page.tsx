'use client';

import { Search, Users, X } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useConsultants } from '@/hooks/useConsultants';
import { StudentGuard } from '@/components/auth/role-guard';
import { buttonStyles, EmptyState, ErrorState, PageHeader, SkeletonBlock } from '@/components/parlezhub/ui';
import { ConsultantCard } from '@/components/parlezhub/consultants/consultant-card';
import { ConsultantSheet } from '@/components/parlezhub/consultants/consultant-sheet';

/** /parlezhub/consultants — language consultants a learner can message and book. */
export default function ConsultantsPage() {
  return (
    <StudentGuard fallbackPath={ROUTES.PARLEZHUB.ROOT}>
      <ConsultantDirectory />
    </StudentGuard>
  );
}

function ConsultantDirectory() {
  // Language gigs only: an astrologer's readings never show up here.
  const {
    profiles,
    totalProfiles,
    searchQuery,
    selectedProfile,
    isLoading,
    error,
    handleSearchChange,
    handleSelectProfile,
    handleCloseDetailsPanel,
    refreshConsultants,
  } = useConsultants({ category: 'language', fallbackName: 'Language consultant' });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Language Consultants"
        title="Find your consultant"
        description="Real people for real feedback. Message a consultant to ask a question, then book a session right from the chat."
      />

      <label className="relative block max-w-xl">
        <span className="sr-only">Search consultants</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by name, language or focus"
          className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-11 text-sm text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </label>

      {error ? (
        <ErrorState title="Consultants could not be loaded" body={error} onRetry={() => void refreshConsultants()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading consultants">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className="h-52" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={Users}
          title={totalProfiles === 0 ? 'No consultants yet' : 'No one matches that search'}
          body={
            totalProfiles === 0
              ? 'Language consultants are joining soon. Meanwhile, keep practising with your AI tutor.'
              : 'Try a different name, language or focus.'
          }
          action={
            totalProfiles > 0 ? (
              <button type="button" onClick={() => handleSearchChange('')} className={buttonStyles.secondary}>
                Clear search
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {profiles.length} {profiles.length === 1 ? 'consultant' : 'consultants'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <ConsultantCard key={profile.id} profile={profile} onSelect={handleSelectProfile} />
            ))}
          </div>
        </>
      )}

      <ConsultantSheet profile={selectedProfile} onClose={handleCloseDetailsPanel} />
    </div>
  );
}
