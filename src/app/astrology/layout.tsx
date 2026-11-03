'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ANALYSIS_CATEGORIES, ANALYSIS_TOPICS } from '@/constants/astrology';
import { ROUTES } from '@/constants/routes';
import {
  buildObservatorySteps,
  OBS_ANCHORS,
  type GuideRole,
} from '@/constants/tour-steps';
import { useAuth } from '@/contexts/auth-context';
import { ChevronRight, Eye, GraduationCap, Users } from 'lucide-react';
import { toast } from 'sonner';

import {
  astrologyChatHref,
  astrologyHref,
  profileHref,
} from '@/lib/astrology-navigation';
import { cn } from '@/lib/utils';
import { useBirthProfile, useDeleteGuestProfile } from '@/hooks/useAstrology';
import { Logo } from '@/components/ui/logo';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { DashboardHeader } from '@/components/agents/astrology/components/dashboard-header';
import { GuestProfileDialog } from '@/components/agents/astrology/components/guest-profile-dialog';
import {
  ProfileSelector,
  SelectedProfile,
} from '@/components/agents/astrology/components/profile-selector';
import { PrimarySidebar } from '@/components/agents/astrology/layout/primary-sidebar';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { RoleSwitcher } from '@/components/common/role-switcher';
import { GuideTourProvider } from '@/components/guide/guide-tour-provider';

const pageTitles: Record<string, string> = {
  [ROUTES.AGENT.ASTROLOGY.ANALYSIS]: 'Chart Analysis',
  [ROUTES.AGENT.ASTROLOGY.DASHA]: 'Dasha Timeline',
  [ROUTES.AGENT.ASTROLOGY.FESTIVAL_CALENDAR]: 'Festival Calendar',
  [ROUTES.AGENT.ASTROLOGY.CHAT]: 'AI Vedic Astrologer',
  [ROUTES.AGENT.ASTROLOGY.ASTROLOGERS]: 'Find Astrologer',
  [ROUTES.AGENT.ASTROLOGY.HIRE.CHAT]: 'Astrologer Chat',
  [ROUTES.AGENT.ASTROLOGY.HIRE.MEETINGS]: 'My Meetings',
  [ROUTES.AGENT.ASTROLOGY.REPORTS]: 'My Reports',
  [ROUTES.AGENT.ASTROLOGY.PROFILES]: 'Birth Profiles',
  [ROUTES.AGENT.ASTROLOGY.PROFILE]: 'Birth Details',
  [ROUTES.AGENT.ASTROLOGY.SHARE]: 'Share Access',
};

export default function AstrologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeRole, hasStudentRole, isRoleSwitching } = useAuth();
  const search = searchParams.toString();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = studentId
    ? undefined
    : searchParams.get('guest_id') || undefined;
  const { data: profile, isLoading } = useBirthProfile(studentId, guestId);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const deleteGuest = useDeleteGuestProfile();
  const selectedProfile: SelectedProfile = {
    type: studentId ? 'student' : guestId ? 'guest' : 'me',
    id: studentId || guestId,
    name: isLoading
      ? 'Loading profile…'
      : profile?.guest_name ||
        profile?.user_name ||
        (studentId ? 'Shared profile' : guestId ? 'Guest profile' : 'My Chart'),
  };
  const topic = ANALYSIS_TOPICS.find(
    (item) =>
      pathname === ROUTES.AGENT.ASTROLOGY.INSIGHTS(item.id) ||
      (item.id === 'navatara' && pathname === ROUTES.AGENT.ASTROLOGY.NAVATARA)
  );
  const category =
    topic && ANALYSIS_CATEGORIES.find((item) => item.id === topic.category);
  const chatCategory = pathname.includes('/insights/')
    ? pathname.split('/').pop()!
    : pathname === ROUTES.AGENT.ASTROLOGY.DASHA
      ? 'dasha'
      : pathname === ROUTES.AGENT.ASTROLOGY.NAVATARA
        ? 'navatara'
        : 'divisional-charts';
  const isChat = pathname === ROUTES.AGENT.ASTROLOGY.CHAT;
  const isConsultationChat =
    pathname === ROUTES.AGENT.ASTROLOGY.HIRE.CHAT ||
    pathname === ROUTES.AGENT.ASTROLOGY.SERVICE.CHAT;
  // Both chat surfaces own the viewport: no breadcrumb, no page padding, and the
  // thread scrolls internally so the composer is never pushed below the fold.
  const isFullViewportChat = isChat || isConsultationChat;
  const isHirePage =
    pathname === ROUTES.AGENT.ASTROLOGY.ASTROLOGERS ||
    pathname.startsWith(`${ROUTES.AGENT.ASTROLOGY.HIRE.ROOT}/`);
  // Hiring and running a practice are not readings of a chart, so the profile
  // switcher and the Dashboard crumb have nothing to say on those pages.
  const isServicePage =
    pathname === ROUTES.AGENT.ASTROLOGY.SERVICE.ROOT ||
    pathname.startsWith(`${ROUTES.AGENT.ASTROLOGY.SERVICE.ROOT}/`);
  const showsProfileContext = !isHirePage && !isServicePage;
  const isTeacher = activeRole === 'TEACHER';
  const guideRole: GuideRole = isTeacher ? 'consultant' : 'student';
  const showHireNav = hasStudentRole && !isTeacher;

  useEffect(() => {
    const openChat = () => router.push(astrologyChatHref(search, chatCategory));
    window.addEventListener('open-ai-astrologer', openChat);
    return () => window.removeEventListener('open-ai-astrologer', openChat);
  }, [router, search, chatCategory]);

  const switchProfile = (selection: SelectedProfile, destination = pathname) =>
    router.push(profileHref(destination, search, selection));
  return (
    <GuideTourProvider
      scope="observatory"
      role={guideRole}
      desktopMinWidth={1024}
      buildSteps={() =>
        buildObservatorySteps(pathname, {
          showHire: showHireNav,
          showService: isTeacher,
        })
      }
      promptTitle="New to Shakti Wheel?"
      promptBody="A one-minute tour of the sidebar: your chart readings, hiring an astrologer, and who you share access with."
    >
      <div className="observatory-shell fixed inset-x-0 top-0 flex h-[100dvh] w-full flex-col overflow-hidden">
        <a
          href="#observatory-content"
          className="obs-button fixed left-4 top-4 z-[100] -translate-y-24 focus:translate-y-0"
        >
          Skip to content
        </a>
        <DashboardHeader
          onToggleNavigation={() => setMobileOpen((value) => !value)}
        >
          <div
            className="border-[var(--solar-gold)]/25 bg-[var(--cosmos-800)]/95 pointer-events-auto absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur sm:px-3"
            data-tour="ws-role-switch"
            aria-label="Active account type"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {isTeacher ? (
                <Users className="h-3.5 w-3.5 text-[var(--solar-gold)]" />
              ) : (
                <GraduationCap className="h-3.5 w-3.5 text-[var(--solar-gold)]" />
              )}
              <span className="hidden md:inline">Active account</span>
            </span>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground">
              {isTeacher ? 'Consultant' : 'End User'}
            </span>
            {hasStudentRole && isTeacher && (
              <RoleSwitcher
                variant="ghost"
                size="sm"
                showLabel={false}
                showCount={false}
                className="-mr-2 h-8 w-10 rounded-full p-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
              />
            )}
            {!isTeacher && (
              <RoleSwitcher
                variant="ghost"
                size="sm"
                showLabel={false}
                showCount={false}
                className="-mr-2 h-8 w-10 rounded-full p-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
              />
            )}
          </div>
          {showsProfileContext && (
            <ProfileSelector
              selectedProfile={selectedProfile}
              onSelect={switchProfile}
              onAddGuest={() => setGuestOpen(true)}
              onEditGuest={(id, name) =>
                switchProfile(
                  { type: 'guest', id, name },
                  ROUTES.AGENT.ASTROLOGY.PROFILE
                )
              }
              onDeleteGuest={(id, name) => setGuestToDelete({ id, name })}
              onEditBirth={() =>
                router.push(
                  astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILE, search)
                )
              }
              onManageProfiles={() =>
                router.push(
                  astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILES, search)
                )
              }
            />
          )}
        </DashboardHeader>
        <div className="flex min-h-0 flex-1">
          <aside
            id="observatory-navigation"
            className="hidden w-60 shrink-0 overflow-y-auto overscroll-y-contain border-r border-border bg-[var(--cosmos-900)] lg:block"
          >
            <PrimarySidebar />
          </aside>
          <main
            id="observatory-content"
            tabIndex={-1}
            data-tour={OBS_ANCHORS.content}
            className={cn(
              'min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain outline-none',
              isFullViewportChat && 'overflow-hidden'
            )}
          >
            <div
              className={cn(
                'obs-page',
                isFullViewportChat && 'obs-page--bleed'
              )}
              key={
                studentId
                  ? `student:${studentId}`
                  : guestId
                    ? `guest:${guestId}`
                    : 'me'
              }
            >
              {!isChat &&
                showsProfileContext &&
                selectedProfile.type !== 'me' && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    <Eye className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      <span className="font-medium text-foreground">
                        {selectedProfile.name}
                      </span>{' '}
                      ·{' '}
                      {studentId
                        ? 'Shared chart · birth details are read-only'
                        : 'Guest chart'}
                    </p>
                  </div>
                )}
              {!isFullViewportChat &&
                showsProfileContext &&
                pathname !== ROUTES.AGENT.ASTROLOGY.ROOT && (
                  <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <li>
                        <Link
                          className="inline-flex min-h-8 items-center hover:text-foreground"
                          href={astrologyHref(
                            ROUTES.AGENT.ASTROLOGY.ROOT,
                            search
                          )}
                        >
                          Dashboard
                        </Link>
                      </li>
                      {pathname.startsWith(
                        `${ROUTES.AGENT.ASTROLOGY.HIRE.ROOT}/`
                      ) && (
                        <>
                          <li aria-hidden="true">
                            <ChevronRight className="h-3 w-3" />
                          </li>
                          <li>
                            <Link
                              href={ROUTES.AGENT.ASTROLOGY.ASTROLOGERS}
                              className="inline-flex min-h-8 items-center hover:text-foreground"
                            >
                              Hire Astrologer
                            </Link>
                          </li>
                        </>
                      )}
                      {topic && (
                        <>
                          <li aria-hidden="true">
                            <ChevronRight className="h-3 w-3" />
                          </li>
                          <li>
                            <Link
                              href={astrologyHref(
                                ROUTES.AGENT.ASTROLOGY.ANALYSIS,
                                search
                              )}
                              className="inline-flex min-h-8 items-center hover:text-foreground"
                            >
                              Chart Analysis
                            </Link>
                          </li>
                        </>
                      )}
                      {category && (
                        <>
                          <li aria-hidden="true">
                            <ChevronRight className="h-3 w-3" />
                          </li>
                          <li>
                            <Link
                              href={`${astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, search)}${studentId || guestId ? '&' : '?'}category=${category.id}`}
                              className="inline-flex min-h-8 items-center hover:text-foreground"
                            >
                              {category.title}
                            </Link>
                          </li>
                        </>
                      )}
                      <li aria-hidden="true">
                        <ChevronRight className="h-3 w-3" />
                      </li>
                      <li aria-current="page" className="text-foreground">
                        {topic?.title ||
                          pageTitles[pathname] ||
                          'Chart exploration'}
                      </li>
                    </ol>
                  </nav>
                )}
              {children}
            </div>
          </main>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="observatory-theme flex w-[min(300px,90vw)] flex-col gap-0 border-border p-0"
          >
            <SheetTitle className="sr-only">Shakti Wheel navigation</SheetTitle>
            <div className="px-7 pb-0 pt-7">
              <Logo size="sm" href={ROUTES.AGENT.ASTROLOGY.ROOT} />
            </div>
            <SheetDescription className="sr-only">
              Navigate your personal observatory.
            </SheetDescription>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PrimarySidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <GuestProfileDialog
          isOpen={guestOpen}
          onClose={() => setGuestOpen(false)}
          onSuccess={(created) =>
            switchProfile(
              {
                type: 'guest',
                id: String(created.id),
                name: created.guest_name || 'Guest',
              },
              ROUTES.AGENT.ASTROLOGY.ROOT
            )
          }
        />
        <ConfirmationDialog
          isOpen={!!guestToDelete}
          onClose={() => {
            if (!deleteGuest.isPending) setGuestToDelete(null);
          }}
          title="Delete guest profile?"
          description={`Delete ${guestToDelete?.name || 'this guest'}’s birth profile? This cannot be undone.`}
          confirmText="Delete profile"
          isLoading={deleteGuest.isPending}
          onConfirm={() => {
            if (!guestToDelete) return;
            deleteGuest.mutate(Number(guestToDelete.id), {
              onSuccess: () => {
                if (guestId === guestToDelete.id)
                  switchProfile(
                    { type: 'me', name: 'My Chart' },
                    ROUTES.AGENT.ASTROLOGY.PROFILES
                  );
                setGuestToDelete(null);
              },
              onError: () =>
                toast.error('Could not delete this profile. Please try again.'),
            });
          }}
        />
      </div>
      {isRoleSwitching && (
        <div
          className="bg-[var(--cosmos-900)]/80 fixed inset-0 z-[90] flex items-center justify-center px-6 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="obs-card flex min-w-[min(20rem,calc(100vw-3rem))] flex-col items-center gap-4 px-8 py-7 text-center shadow-2xl">
            <span
              className="border-[var(--solar-gold)]/25 h-10 w-10 animate-spin rounded-full border-2 border-t-[var(--solar-gold)] motion-reduce:animate-none"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">
                Switching account type
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Opening your astrology workspace…
              </p>
            </div>
          </div>
        </div>
      )}
    </GuideTourProvider>
  );
}
