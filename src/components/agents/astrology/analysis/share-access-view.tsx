'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, Loader2, Search, Trash2, UserPlus } from 'lucide-react';

import { AstrologyAccess } from '@/types/astrology';
import {
  useAstrologyAccessList,
  useGrantAstrologyAccess,
  useRevokeAstrologyAccess,
} from '@/hooks/useAstrology';
import { useConsultants } from '@/hooks/useConsultants';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ServiceDetailsDrawer,
  ServiceDetailsModal,
  ServicesGrid,
} from '@/components/consultants';

interface ShareAccessViewProps {
  onBack: () => void;
}

const ShareAccessView: React.FC<ShareAccessViewProps> = ({ onBack }) => {
  const isIsMobile = useIsMobile();
  const {
    services,
    searchQuery,
    selectedService,
    isDetailsPanelOpen,
    isLoading: isLoadingGigs,
    handleSearchChange,
    handleClearFilters,
    handleSelectService,
    handleCloseDetailsPanel,
  } = useConsultants();

  const { data: accessList, isLoading: isLoadingAccess } =
    useAstrologyAccessList();

  const { mutate: grantAccess, isPending: isGranting } =
    useGrantAstrologyAccess();
  const { mutate: revokeAccess, isPending: isRevoking } =
    useRevokeAstrologyAccess();

  const handleGrant = (teacherId: string) => {
    grantAccess(teacherId);
  };

  const handleRevoke = (teacherId: string) => {
    revokeAccess(teacherId);
  };

  const isAlreadyGranted = (teacherId: string) => {
    if (!accessList) return false;
    return accessList.some(
      (access: AstrologyAccess) => access.teacher.id === teacherId
    );
  };

  const astrologyGigs = useMemo(() => {
    return services.filter((s) => s.service.type === 'astrology');
  }, [services]);

  return (
    <div className="flex w-full flex-col duration-1000 animate-in fade-in zoom-in-95">
      {/* Premium Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-primary-500/20 p-6 pt-6 md:flex-row md:items-center md:p-8">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-primary-500 md:text-4xl">
            <span className="text-3xl md:text-5xl">🤝</span> Share Access
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
            MANAGE ASTROLOGER PERMISSIONS
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="rounded-full border-primary-500/30 bg-primary-500/10 text-primary-300 shadow-sm backdrop-blur-sm hover:bg-primary-500/20 hover:text-primary-100"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 p-6 md:p-12">
        {/* Find an Astrologer Section */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-400">
              Find an Astrologer
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-primary-100/60">
              Browse professional astrology services and grant access to trusted
              readers to analyze your natal chart and transits.
            </p>
          </div>

          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-500/50" />
            <Input
              type="text"
              placeholder="Search astrologers by name or specialty..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-14 rounded-2xl border-primary-500/20 bg-white/5 pl-12 text-lg text-foreground shadow-lg placeholder:text-primary-100/30 focus-visible:ring-primary-500/50"
            />
            {astrologyGigs.length > 0 && (
              <p className="mt-3 px-1 text-xs font-bold uppercase tracking-widest text-primary-500/60">
                {astrologyGigs.length} Astrologers Available
              </p>
            )}
          </div>

          {isLoadingGigs ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-primary-500/10 bg-white/5 backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary-500/50" />
            </div>
          ) : astrologyGigs.length > 0 ? (
            <ServicesGrid
              services={astrologyGigs}
              onSelectService={handleSelectService}
              className='lg:grid-cols-2'
            />
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-3xl border border-primary-500/10 bg-white/5 py-12 text-center backdrop-blur-sm">
              <p className="text-lg font-medium text-primary-100/40">
                No astrologers found matching your search.
              </p>
              <Button
                variant="link"
                onClick={handleClearFilters}
                className="mt-2 text-primary-500"
              >
                Clear search
              </Button>
            </div>
          )}
        </section>

        <hr className="border-t border-primary-500/10" />

        {/* Currently Shared With Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-2xl font-bold text-primary-400">
              Currently Shared With
            </h2>
            <p className="text-sm text-primary-100/60">
              Astrologers who have ongoing access to view your natal chart and
              transits.
            </p>
          </div>

          <div className="bg-white/1 overflow-hidden rounded-2xl border border-primary-500/20 shadow-sm">
            {isLoadingAccess ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : !accessList || accessList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-primary-100/40">
                <p>
                  You haven&apos;t shared your chart with any astrologers yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-primary-500/10">
                {accessList.map((access: AstrologyAccess) => (
                  <div
                    key={access.teacher.id}
                    className="flex items-center justify-between gap-4 p-4 px-6 transition-colors hover:bg-white/5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary-500/20">
                        <AvatarImage
                          src={access.teacher.profile_picture || ''}
                        />
                        <AvatarFallback className="bg-primary-500/10 font-medium text-primary-300">
                          {(access.teacher.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <p className="truncate font-medium text-primary-100">
                          {access.teacher.full_name || 'Astrologer'}
                        </p>
                        <p className="truncate text-xs text-primary-500/60">
                          Granted on{' '}
                          {new Date(access.granted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(access.teacher.id)}
                      disabled={isRevoking}
                      className="shrink-0 font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      {isRevoking ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {isIsMobile ? (
        <ServiceDetailsModal
          serviceCard={selectedService}
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseDetailsPanel}
          footerAction={
            selectedService && (
              <Button
                onClick={() => handleGrant(selectedService.service.teacherId)}
                disabled={
                  isGranting ||
                  isAlreadyGranted(selectedService.service.teacherId)
                }
                className={
                  isAlreadyGranted(selectedService.service.teacherId)
                    ? 'w-full bg-primary-500/10 text-primary-300 opacity-80'
                    : 'w-full bg-primary-500 font-bold text-primary-950 shadow-lg shadow-primary-500/20 hover:bg-primary-600'
                }
              >
                {isAlreadyGranted(selectedService.service.teacherId) ? (
                  'Access Already Granted'
                ) : isGranting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Grant Access
                  </>
                )}
              </Button>
            )
          }
        />
      ) : (
        <ServiceDetailsDrawer
          serviceCard={selectedService}
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseDetailsPanel}
          footerAction={
            selectedService && (
              <Button
                onClick={() => handleGrant(selectedService.service.teacherId)}
                disabled={
                  isGranting ||
                  isAlreadyGranted(selectedService.service.teacherId)
                }
                className={
                  isAlreadyGranted(selectedService.service.teacherId)
                    ? 'bg-primary-500/10 text-primary-300 opacity-80'
                    : 'bg-primary-500 font-bold text-primary-950 shadow-lg shadow-primary-500/20 px-8 hover:bg-primary-600'
                }
              >
                {isAlreadyGranted(selectedService.service.teacherId) ? (
                  'Access Already Granted'
                ) : isGranting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Grant Access
                  </>
                )}
              </Button>
            )
          }
        />
      )}
    </div>
  );
};

export default ShareAccessView;
