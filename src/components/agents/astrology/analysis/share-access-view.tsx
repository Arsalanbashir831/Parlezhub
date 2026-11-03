'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';

import {
  AstrologyAccess,
  AstrologyConsultant,
  SharedStudentAccess,
} from '@/types/astrology';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useAstrologyAccessList,
  useConsultantSharedStudents,
  useGrantAstrologyAccess,
  useRevokeAstrologyAccess,
  useSearchAstrologers,
} from '@/hooks/useAstrology';
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
  LoadingLayout,
  RequestError,
  Skeleton,
} from '@/components/agents/astrology/ui/observatory-state';

interface ShareAccessViewProps {
  onBack: () => void;
}
type AccessChange = {
  action: 'grant' | 'revoke';
  teacherId: string;
  name: string;
};

const consultantName = (consultant: AstrologyConsultant) =>
  [consultant.first_name, consultant.last_name].filter(Boolean).join(' ') ||
  'Astrologer';

export default function ShareAccessView({ onBack }: ShareAccessViewProps) {
  const router = useRouter();
  const { activeRole } = useAuth();
  const isConsultant = activeRole === 'TEACHER';
  const [sharedSearch, setSharedSearch] = useState('');
  const [sharedPage, setSharedPage] = useState(1);
  const sharedPageSize = 12;
  const [debouncedSharedSearch] = useDebounce(sharedSearch.trim(), 300);
  const [pendingSharedProfile, setPendingSharedProfile] =
    useState<SharedStudentAccess | null>(null);
  const sharedStudents = useConsultantSharedStudents(
    {
      search: debouncedSharedSearch,
      page: sharedPage,
      page_size: sharedPageSize,
    },
    isConsultant
  );
  const {
    data: accessList,
    isLoading: isLoadingAccess,
    isError: isAccessError,
    isFetching: isFetchingAccess,
    refetch: refetchAccess,
  } = useAstrologyAccessList();
  const { mutate: grantAccess, isPending: isGranting } =
    useGrantAstrologyAccess();
  const { mutate: revokeAccess, isPending: isRevoking } =
    useRevokeAstrologyAccess();
  const [confirmation, setConfirmation] = useState<AccessChange | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery.trim(), 300);
  const {
    data: searchResult,
    isFetching: isSearching,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearchAstrologers(debouncedQuery);
  const isChangingAccess = isGranting || isRevoking;

  // The teachers endpoint may return a paginated object or a plain array.
  const astrologers = useMemo<AstrologyConsultant[]>(() => {
    if (!searchResult) return [];
    return Array.isArray(searchResult)
      ? searchResult
      : ((searchResult as { results?: AstrologyConsultant[] }).results ?? []);
  }, [searchResult]);

  const isAlreadyGranted = (teacherId: string) =>
    accessList?.some(
      (access: AstrologyAccess) => access.teacher.id === teacherId
    ) ?? false;

  const handleGrant = (teacher: AstrologyConsultant) => {
    if (
      isLoadingAccess ||
      isAccessError ||
      isChangingAccess ||
      isAlreadyGranted(teacher.id)
    )
      return;
    setConfirmation({
      action: 'grant',
      teacherId: teacher.id,
      name: consultantName(teacher),
    });
  };
  const handleRevoke = (teacherId: string) => {
    if (isChangingAccess) return;
    const name =
      accessList?.find((access) => access.teacher.id === teacherId)?.teacher
        .full_name || 'this astrologer';
    setConfirmation({ action: 'revoke', teacherId, name });
  };
  const handleConfirm = () => {
    if (!confirmation || isChangingAccess) return;
    const onSuccess = () => setConfirmation(null);
    if (confirmation.action === 'grant')
      grantAccess(confirmation.teacherId, { onSuccess });
    else revokeAccess(confirmation.teacherId, { onSuccess });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 text-foreground">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <p className="obs-label flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            {isConsultant
              ? 'Consultation access'
              : 'Personal chart permissions'}
          </p>
          <h1 className="obs-title">Share Access</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {isConsultant
              ? 'Review the birth profiles students have shared with you for consultation.'
              : 'Choose which astrologers may view your personal birth profile for consultation.'}
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
          {isConsultant
            ? 'Students choose which birth details to share with your account. Shared profiles are available for consultation and remain read-only.'
            : 'You can share your profile only with an astrologer who has a Consultant account. End User accounts cannot receive chart access. Granting access lets the selected Consultant view your birth details, natal chart, and transits for consultation.'}
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {isConsultant
            ? 'Access is granted by each student and is not a public link. You can view the profile data they have made available, subject to the existing consultation permissions.'
            : 'This is ongoing account access, not a public link. It applies to your personal chart, not a guest or another student’s profile. Report access remains governed by existing account permissions. You can revoke this access below.'}
        </p>
      </section>

      {isConsultant ? (
        <section
          className="space-y-4"
          aria-labelledby="shared-profiles-heading"
        >
          <div className="space-y-1">
            <h2 id="shared-profiles-heading" className="text-xl font-semibold">
              Profiles you can access
            </h2>
            <p className="text-sm text-muted-foreground">
              {sharedStudents.data
                ? `${sharedStudents.data.count} shared profile${sharedStudents.data.count === 1 ? '' : 's'} available for consultation`
                : 'Students who have granted your account access appear here.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search shared profiles"
                placeholder="Search shared profiles by name or email…"
                value={sharedSearch}
                onChange={(event) => {
                  setSharedSearch(event.target.value);
                  setSharedPage(1);
                }}
                className="h-11 rounded-xl border-border bg-card pl-10 text-base text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Read-only access
            </span>
          </div>
          <div className="obs-card overflow-hidden">
            {sharedStudents.isLoading ? (
              <LoadingLayout
                label="Loading shared profiles…"
                className="divide-y divide-border"
              >
                {[0, 1].map((row) => (
                  <div key={row} className="flex items-center gap-3 p-4 sm:p-5">
                    <Skeleton
                      className="h-11 w-11 shrink-0"
                      rounded="rounded-full"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton
                        className="h-4 w-40 max-w-full"
                        rounded="rounded-md"
                      />
                      <Skeleton
                        className="h-3 w-56 max-w-full"
                        rounded="rounded-md"
                      />
                    </div>
                    <Skeleton className="h-9 w-24" rounded="rounded-xl" />
                  </div>
                ))}
              </LoadingLayout>
            ) : sharedStudents.isError ? (
              <div role="alert" className="space-y-3 p-6">
                <p className="text-sm text-muted-foreground">
                  We couldn’t load the profiles shared with your account.
                </p>
                <Button
                  onClick={() => sharedStudents.refetch()}
                  variant="outline"
                  className="obs-control"
                >
                  Retry
                </Button>
              </div>
            ) : !sharedStudents.data?.results.length ? (
              <div className="p-8 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  {debouncedSharedSearch
                    ? 'No matching shared profiles'
                    : 'No shared profiles yet'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {debouncedSharedSearch
                    ? 'Try a different name.'
                    : 'When a student grants access, their read-only profile will appear here.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {sharedStudents.data.results.map(
                  (access: SharedStudentAccess) => (
                    <li
                      key={access.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0 border border-border">
                          <AvatarImage
                            src={access.student.profile_picture || ''}
                            alt=""
                          />
                          <AvatarFallback className="bg-muted text-foreground">
                            {(access.student.full_name || 'S')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-1">
                          <p className="break-words text-sm font-semibold">
                            {access.student.full_name || 'Student profile'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Shared{' '}
                            {new Date(access.granted_at).toLocaleDateString()} ·
                            Read-only
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="obs-control shrink-0 self-start sm:self-auto"
                        onClick={() => setPendingSharedProfile(access)}
                      >
                        Confirm &amp; view
                      </Button>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
          {sharedStudents.data &&
            (sharedStudents.data.previous || sharedStudents.data.next) && (
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="obs-control"
                  disabled={!sharedStudents.data.previous}
                  onClick={() => setSharedPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {sharedPage}
                </span>
                <Button
                  variant="outline"
                  className="obs-control"
                  disabled={!sharedStudents.data.next}
                  onClick={() => setSharedPage((page) => page + 1)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
        </section>
      ) : null}

      {!isConsultant && (
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
              <LoadingLayout
                label="Loading access permissions…"
                className="divide-y divide-border"
              >
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    aria-hidden="true"
                    className="flex items-center gap-3 p-4 sm:p-5"
                  >
                    <Skeleton
                      className="h-11 w-11 shrink-0"
                      rounded="rounded-full"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton
                        className="h-4 w-40 max-w-full"
                        rounded="rounded-md"
                      />
                      <Skeleton
                        className="h-3 w-56 max-w-full"
                        rounded="rounded-md"
                      />
                    </div>
                    <Skeleton
                      className="ml-auto h-9 w-32 shrink-0"
                      rounded="rounded-xl"
                    />
                  </div>
                ))}
              </LoadingLayout>
            ) : isAccessError ? (
              <div role="alert" className="space-y-3 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Unable to load current permissions. Sharing is disabled until
                  access status is available.
                </p>
                <Button
                  onClick={() => refetchAccess()}
                  disabled={isFetchingAccess}
                  variant="outline"
                  className="obs-control gap-2"
                >
                  <Loader2
                    className={`h-4 w-4 ${isFetchingAccess ? 'animate-spin' : 'hidden'}`}
                    aria-hidden="true"
                  />
                  {isFetchingAccess ? 'Checking again…' : 'Retry access list'}
                </Button>
              </div>
            ) : !accessList?.length ? (
              <p className="p-6 text-sm leading-relaxed text-muted-foreground">
                Your chart is not currently shared with any astrologers. Search
                below when you are ready to grant access.
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
      )}

      {!isConsultant && (
        <section className="flex min-w-0 flex-col gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Find an astrologer to give access
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Search an astrologer by name or email, then confirm whom you want
              to grant access to. Searching does not share your profile.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="obs-button min-h-11 gap-2">
              <Link href={ROUTES.AGENT.ASTROLOGY.ASTROLOGERS}>
                <UserPlus className="h-4 w-4" /> Find Astrologer
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">
              Or give access directly by searching their name or email below.
            </span>
          </div>
          <div className="relative w-full max-w-xl">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search astrologers by name or email"
              placeholder="Search astrologers by name or email…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 rounded-xl border-border bg-card pl-10 text-base text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {!debouncedQuery ? (
            <div className="obs-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Type a name or email above to find an astrologer. Only the
                astrologers you confirm below receive access to your personal
                chart.
              </p>
            </div>
          ) : isSearching ? (
            <LoadingLayout
              label="Searching astrologers…"
              className="divide-y divide-border"
            >
              {[0, 1].map((row) => (
                <div
                  key={row}
                  aria-hidden="true"
                  className="flex items-center gap-3 p-4 sm:p-5"
                >
                  <Skeleton
                    className="h-11 w-11 shrink-0"
                    rounded="rounded-full"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton
                      className="h-4 w-40 max-w-full"
                      rounded="rounded-md"
                    />
                    <Skeleton
                      className="h-3 w-56 max-w-full"
                      rounded="rounded-md"
                    />
                  </div>
                  <Skeleton
                    className="ml-auto h-9 w-32 shrink-0"
                    rounded="rounded-xl"
                  />
                </div>
              ))}
            </LoadingLayout>
          ) : isSearchError ? (
            <RequestError
              title="Astrologer search could not be loaded"
              message="Your current access list is unaffected. Try the search again."
              onRetry={refetchSearch}
              retryLabel="Retry search"
            />
          ) : !astrologers.length ? (
            <div className="obs-card p-6">
              <p className="text-sm text-muted-foreground">
                No astrologer matches “{debouncedQuery}”. Check the spelling or
                try a different name or email.
              </p>
            </div>
          ) : (
            <ul className="obs-card divide-y divide-border">
              {astrologers.map((astrologer) => {
                const granted = isAlreadyGranted(astrologer.id);
                return (
                  <li
                    key={astrologer.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-11 w-11 shrink-0 border border-border">
                        <AvatarImage
                          src={astrologer.profile_picture || ''}
                          alt=""
                        />
                        <AvatarFallback className="bg-muted text-foreground">
                          {consultantName(astrologer)[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-1">
                        <p className="break-words text-sm font-semibold">
                          {consultantName(astrologer)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[
                            astrologer.qualification,
                            astrologer.experience_years
                              ? `${astrologer.experience_years} year${astrologer.experience_years === 1 ? '' : 's'} experience`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'Astrologer'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGrant(astrologer)}
                      disabled={
                        granted ||
                        isChangingAccess ||
                        isLoadingAccess ||
                        isAccessError
                      }
                      variant={granted ? 'outline' : 'default'}
                      className={`obs-button shrink-0 gap-2 self-start sm:self-auto ${granted ? '' : 'min-h-11'} disabled:opacity-60`}
                    >
                      {granted ? (
                        <>
                          <ShieldCheck className="h-4 w-4" /> Access granted
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" /> Grant access
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {!isConsultant && (
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
      )}
      {isConsultant && (
        <AlertDialog
          open={!!pendingSharedProfile}
          onOpenChange={(open) => {
            if (!open) setPendingSharedProfile(null);
          }}
        >
          <AlertDialogContent className="observatory-theme max-w-[calc(100vw-2rem)] rounded-2xl border-border bg-card text-foreground sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm profile access</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {pendingSharedProfile?.student.full_name || 'This student'} has
                shared this profile with your Consultant account. Confirm to
                open the read-only birth chart. You can only view data the End
                User has made available.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="obs-control min-h-11">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="obs-button min-h-11"
                onClick={(event) => {
                  event.preventDefault();
                  if (!pendingSharedProfile) return;
                  const studentId = pendingSharedProfile.student.id;
                  setPendingSharedProfile(null);
                  router.push(
                    `${ROUTES.AGENT.ASTROLOGY.ROOT}?student_id=${studentId}`
                  );
                }}
              >
                Confirm &amp; open profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
