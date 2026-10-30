'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';

import { AstrologyAccess } from '@/types/astrology';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  useAstrologyAccessList,
  useGrantAstrologyAccess,
  useRevokeAstrologyAccess,
} from '@/hooks/useAstrology';
import { useConsultants } from '@/hooks/useConsultants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
type AccessChange = {
  action: 'grant' | 'revoke';
  teacherId: string;
  name: string;
};

export default function ShareAccessView({ onBack }: ShareAccessViewProps) {
  const isMobile = useIsMobile();
  const {
    services,
    searchQuery,
    selectedService,
    isDetailsPanelOpen,
    isLoading: isLoadingGigs,
    error: servicesError,
    refreshConsultants,
    handleSearchChange,
    handleClearFilters,
    handleSelectService,
    handleCloseDetailsPanel,
  } = useConsultants();
  const {
    data: accessList,
    isLoading: isLoadingAccess,
    isError: isAccessError,
    refetch: refetchAccess,
  } = useAstrologyAccessList();
  const { mutate: grantAccess, isPending: isGranting } =
    useGrantAstrologyAccess();
  const { mutate: revokeAccess, isPending: isRevoking } =
    useRevokeAstrologyAccess();
  const [confirmation, setConfirmation] = useState<AccessChange | null>(null);
  const isChangingAccess = isGranting || isRevoking;

  const handleGrant = (teacherId: string) => {
    if (
      isLoadingAccess ||
      isAccessError ||
      isChangingAccess ||
      isAlreadyGranted(teacherId)
    )
      return;
    const name =
      selectedService?.consultantName ||
      services.find((service) => service.service.teacherId === teacherId)
        ?.consultantName ||
      'this astrologer';
    // Close the service detail overlay before opening the sensitive-change dialog.
    handleCloseDetailsPanel();
    setConfirmation({ action: 'grant', teacherId, name });
  };
  const handleRevoke = (teacherId: string) => {
    if (isChangingAccess) return;
    const name =
      accessList?.find((access) => access.teacher.id === teacherId)?.teacher
        .full_name || 'this astrologer';
    setConfirmation({ action: 'revoke', teacherId, name });
  };
  const isAlreadyGranted = (teacherId: string) =>
    accessList?.some(
      (access: AstrologyAccess) => access.teacher.id === teacherId
    ) ?? false;
  const handleConfirm = () => {
    if (!confirmation || isChangingAccess) return;
    const onSuccess = () => setConfirmation(null);
    if (confirmation.action === 'grant')
      grantAccess(confirmation.teacherId, { onSuccess });
    else revokeAccess(confirmation.teacherId, { onSuccess });
  };
  const astrologyGigs = useMemo(
    () => services.filter((service) => service.service.type === 'astrology'),
    [services]
  );

  const footerAction = selectedService ? (
    <Button
      onClick={() => handleGrant(selectedService.service.teacherId)}
      disabled={
        isChangingAccess ||
        isLoadingAccess ||
        isAccessError ||
        isAlreadyGranted(selectedService.service.teacherId)
      }
      className="obs-button min-h-11 w-full gap-2 px-4 text-sm disabled:opacity-60"
    >
      {isAlreadyGranted(selectedService.service.teacherId) ? (
        'Access already granted'
      ) : isLoadingAccess ? (
        'Checking access…'
      ) : isAccessError ? (
        'Access status unavailable'
      ) : isGranting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Granting access…
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" /> Review & grant access
        </>
      )}
    </Button>
  ) : null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 text-foreground">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <p className="obs-label flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Personal chart permissions
          </p>
          <h1 className="obs-title">Share Access</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Choose which astrologers may view your personal birth profile for
            consultation.
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="obs-control shrink-0 gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back to dashboard
        </Button>
      </header>

      <section className="obs-card space-y-2 p-5">
        <h2 className="text-base font-semibold">Understand what you share</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Granting access lets the selected astrologer view your personal birth
          details, including birth date, time, and location, together with the
          natal chart and transits used for consultation. Share only with
          someone you trust.
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          This is ongoing account access, not a public link. It applies to your
          personal chart, not a guest or another student’s profile. Report
          access remains governed by existing account permissions. You can
          revoke this access below.
        </p>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Who has access</h2>
          <p className="text-sm text-muted-foreground">
            {!isLoadingAccess && !isAccessError && accessList
              ? `${accessList.length} astrologer${accessList.length === 1 ? '' : 's'} with granted access`
              : 'Current permissions for your personal birth profile.'}
          </p>
        </div>
        <div className="obs-card overflow-hidden">
          {isLoadingAccess ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 p-8"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary-400 motion-reduce:animate-none" />
              <span className="text-sm text-muted-foreground">
                Loading access permissions…
              </span>
            </div>
          ) : isAccessError ? (
            <div role="alert" className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">
                Unable to load current permissions. Sharing is disabled until
                access status is available.
              </p>
              <Button
                onClick={() => refetchAccess()}
                variant="outline"
                className="obs-control"
              >
                Retry access list
              </Button>
            </div>
          ) : !accessList?.length ? (
            <p className="p-6 text-sm leading-relaxed text-muted-foreground">
              Your chart is not currently shared with any astrologers. Browse
              services below when you are ready to grant access.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {accessList.map((access: AstrologyAccess) => (
                <li
                  key={access.teacher.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-11 w-11 shrink-0 border border-border">
                      <AvatarImage
                        src={access.teacher.profile_picture || ''}
                        alt=""
                      />
                      <AvatarFallback className="bg-muted text-foreground">
                        {(access.teacher.full_name || 'A')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                      <p className="break-words text-sm font-semibold">
                        {access.teacher.full_name || 'Astrologer'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Access granted ·{' '}
                        <time dateTime={access.granted_at}>
                          {new Date(access.granted_at).toLocaleDateString()}
                        </time>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleRevoke(access.teacher.id)}
                    disabled={isChangingAccess}
                    className="obs-control shrink-0 gap-2 self-start text-red-400 sm:self-auto"
                  >
                    <Trash2 className="h-4 w-4" /> Revoke access
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Find an astrologer</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Review a service, then confirm whom you want to grant access to.
            Browsing does not share your profile.
          </p>
        </div>
        <div className="relative w-full max-w-xl">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search astrologers by name or specialty"
            placeholder="Search astrologers by name or specialty…"
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="h-11 rounded-xl border-border bg-card pl-10 text-base text-foreground placeholder:text-muted-foreground"
          />
        </div>
        {isLoadingGigs ? (
          <div
            role="status"
            className="obs-card flex min-h-[180px] items-center justify-center gap-3 p-6"
          >
            <Loader2 className="h-5 w-5 animate-spin text-primary-400 motion-reduce:animate-none" />
            <p className="text-sm text-muted-foreground">
              Loading astrology services…
            </p>
          </div>
        ) : servicesError ? (
          <div role="alert" className="obs-card space-y-3 p-5">
            <p className="text-sm text-muted-foreground">
              Astrology services could not be loaded.
            </p>
            <Button
              onClick={refreshConsultants}
              variant="outline"
              className="obs-control"
            >
              Retry services
            </Button>
          </div>
        ) : astrologyGigs.length ? (
          <>
            <p className="text-xs text-muted-foreground">
              {astrologyGigs.length} matching astrology service
              {astrologyGigs.length === 1 ? '' : 's'}
            </p>
            <ServicesGrid
              services={astrologyGigs}
              onSelectService={handleSelectService}
              className="lg:grid-cols-2"
            />
          </>
        ) : (
          <div className="obs-card space-y-3 p-6">
            <p className="text-sm text-muted-foreground">
              No astrology services match your search.
            </p>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="obs-control"
            >
              Clear search
            </Button>
          </div>
        )}
      </section>

      {isMobile ? (
        <ServiceDetailsModal
          serviceCard={selectedService}
          isOpen={isDetailsPanelOpen && !!selectedService}
          onClose={handleCloseDetailsPanel}
          footerAction={footerAction}
        />
      ) : (
        <ServiceDetailsDrawer
          serviceCard={selectedService}
          isOpen={isDetailsPanelOpen && !!selectedService}
          onClose={handleCloseDetailsPanel}
          footerAction={footerAction}
        />
      )}

      <AlertDialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open && !isChangingAccess) setConfirmation(null);
        }}
      >
        <AlertDialogContent className="observatory-theme max-w-[calc(100vw-2rem)] rounded-2xl border-border bg-card text-foreground sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmation?.action === 'grant'
                ? 'Grant personal chart access?'
                : 'Revoke personal chart access?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {confirmation?.action === 'grant'
                ? `${confirmation.name} will be able to view your personal birth date, time, location, natal chart, and transits through the existing consultation permissions. Confirm only if you trust this astrologer.`
                : `Remove ${confirmation?.name ?? 'this astrologer'}’s ongoing access to your personal birth profile. Revoking access cannot recall information they have already viewed or saved.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isChangingAccess}
              className="obs-control min-h-11"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              disabled={isChangingAccess}
              className="obs-button min-h-11 gap-2"
            >
              {isChangingAccess ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : confirmation?.action === 'grant' ? (
                'Confirm grant'
              ) : (
                'Confirm revoke'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
