'use client';

import { Filter, Search, Sparkles, X } from 'lucide-react';

import { useConsultants } from '@/hooks/useConsultants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { AstrologerProfileCard } from '@/components/consultants/astrologer-profile-card';
import { AstrologerProfileDrawer } from '@/components/consultants/astrologer-profile-drawer';

export default function ConsultantsPage() {
  const {
    profiles,
    totalProfiles,
    searchQuery,
    priceRange,
    maxPrice,
    showFilters,
    selectedProfile,
    isLoading,
    error,
    handleSearchChange,
    handlePriceRangeChange,
    handleToggleFilters,
    handleClearFilters,
    handleSelectProfile,
    handleCloseDetailsPanel,
    refreshConsultants,
  } = useConsultants();
  const hasFilters =
    Boolean(searchQuery.trim()) ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_80%_15%,rgba(255,163,90,0.13),transparent_48%),linear-gradient(125deg,#1b1815,#0e0e0d_68%)] px-6 py-9 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-ember/10 sm:right-16"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-6 -top-14 h-52 w-52 rounded-full border border-ember/10 sm:right-28"
          aria-hidden="true"
        />
        <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ember">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Personal guidance
        </p>
        <h1 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight text-white sm:text-5xl">
          Find your astrologer
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
          Meet experienced astrologers, explore their sessions, and start a
          conversation when you find the right fit.
        </p>
      </header>

      <section aria-label="Find and filter astrologers" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
              aria-hidden="true"
            />
            <Input
              aria-label="Search astrologers"
              placeholder="Search by name, specialty, or session…"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="h-12 rounded-xl border-white/10 bg-[#151514] pl-11 pr-10 text-white placeholder:text-white/40 focus-visible:ring-ember"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleToggleFilters}
            aria-expanded={showFilters}
            className="h-12 rounded-xl border-white/15 bg-[#151514] px-5 text-white hover:bg-white/10 hover:text-white"
          >
            <Filter aria-hidden="true" /> Price filter
          </Button>
        </div>
        {showFilters && (
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#151514] p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-sm font-medium text-white">
                Session price
              </p>
              <Slider
                aria-label="Session price range"
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                min={0}
                max={maxPrice}
                step={maxPrice > 500 ? 10 : 5}
                className="w-full"
              />
              <div className="mt-3 flex justify-between text-xs text-white/55">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearFilters}
              className="self-start text-ember hover:bg-ember/10 hover:text-ember-soft sm:self-end"
            >
              Clear filters
            </Button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-white/55" aria-live="polite">
            {isLoading
              ? 'Finding astrologers…'
              : `${profiles.length} ${profiles.length === 1 ? 'astrologer' : 'astrologers'} found`}
          </p>
          {hasFilters && !showFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-ember hover:text-ember-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {error ? (
        <section
          role="alert"
          className="rounded-2xl border border-white/10 bg-[#151514] px-6 py-12 text-center"
        >
          <h2 className="text-lg font-semibold text-white">
            Couldn’t load astrologers
          </h2>
          <p className="mt-2 text-sm text-white/60">{error}</p>
          <Button onClick={refreshConsultants} className="mt-5">
            Try again
          </Button>
        </section>
      ) : isLoading ? (
        <div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Loading astrologers"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#10100f] p-6"
            >
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <AstrologerProfileCard
              key={profile.id}
              profile={profile}
              priceRange={priceRange}
              onSelect={handleSelectProfile}
            />
          ))}
        </div>
      ) : (
        <section className="rounded-[1.75rem] border border-white/10 bg-[#10100f] px-6 py-14 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-ember/20 bg-ember/10 text-ember">
            <Search className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-2xl text-white">
            {totalProfiles === 0
              ? 'No astrologers available yet'
              : 'No matching astrologers'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">
            {totalProfiles === 0
              ? 'Please check back soon for new astrology consultations.'
              : 'Try another name, specialty, or price range.'}
          </p>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="mt-6 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Clear filters
            </Button>
          )}
        </section>
      )}

      <AstrologerProfileDrawer
        profile={selectedProfile}
        onClose={handleCloseDetailsPanel}
      />
    </div>
  );
}
