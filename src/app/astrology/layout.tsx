'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useBirthProfile, useDeleteGuestProfile } from '@/hooks/useAstrology';
import { DashboardHeader } from '@/components/agents/astrology/components/dashboard-header';
import { GuestProfileDialog } from '@/components/agents/astrology/components/guest-profile-dialog';
import { ProfileSelector, SelectedProfile } from '@/components/agents/astrology/components/profile-selector';
import { PrimarySidebar } from '@/components/agents/astrology/layout/primary-sidebar';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { Logo } from '@/components/ui/logo';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ANALYSIS_CATEGORIES, ANALYSIS_TOPICS } from '@/constants/astrology';
import { ROUTES } from '@/constants/routes';
import { astrologyChatHref, astrologyHref, profileHref } from '@/lib/astrology-navigation';

const pageTitles: Record<string, string> = {
  [ROUTES.AGENT.ASTROLOGY.ANALYSIS]: 'Chart Analysis',
  [ROUTES.AGENT.ASTROLOGY.DASHA]: 'Dasha Timeline',
  [ROUTES.AGENT.ASTROLOGY.FESTIVAL_CALENDAR]: 'Festival Calendar',
  [ROUTES.AGENT.ASTROLOGY.CHAT]: 'AI Vedic Astrologer',
  [ROUTES.AGENT.ASTROLOGY.REPORTS]: 'My Reports',
  [ROUTES.AGENT.ASTROLOGY.PROFILES]: 'Birth Profiles',
  [ROUTES.AGENT.ASTROLOGY.PROFILE]: 'Birth Details',
  [ROUTES.AGENT.ASTROLOGY.SHARE]: 'Share Access',
};

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = studentId ? undefined : searchParams.get('guest_id') || undefined;
  const { data: profile, isLoading } = useBirthProfile(studentId, guestId);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string } | null>(null);
  const deleteGuest = useDeleteGuestProfile();
  const selectedProfile: SelectedProfile = {
    type: studentId ? 'student' : guestId ? 'guest' : 'me',
    id: studentId || guestId,
    name: isLoading ? 'Loading profile…' : profile?.guest_name || profile?.user_name || (studentId ? 'Shared profile' : guestId ? 'Guest profile' : 'My Chart'),
  };
  const topic = ANALYSIS_TOPICS.find(item => pathname === ROUTES.AGENT.ASTROLOGY.INSIGHTS(item.id) || (item.id === 'navatara' && pathname === ROUTES.AGENT.ASTROLOGY.NAVATARA));
  const category = topic && ANALYSIS_CATEGORIES.find(item => item.id === topic.category);
  const chatCategory = pathname.includes('/insights/') ? pathname.split('/').pop()! : pathname === ROUTES.AGENT.ASTROLOGY.DASHA ? 'dasha' : pathname === ROUTES.AGENT.ASTROLOGY.NAVATARA ? 'navatara' : 'divisional-charts';

  useEffect(() => {
    const openChat = () => router.push(astrologyChatHref(search, chatCategory));
    window.addEventListener('open-ai-astrologer', openChat);
    return () => window.removeEventListener('open-ai-astrologer', openChat);
  }, [router, search, chatCategory]);

  const switchProfile = (selection: SelectedProfile, destination = pathname) => router.push(profileHref(destination, search, selection));
  return (
    <div className="observatory-shell fixed inset-x-0 top-0 flex h-[100dvh] w-full flex-col overflow-hidden">
      <a href="#observatory-content" className="obs-button fixed left-4 top-4 z-[100] -translate-y-24 focus:translate-y-0">Skip to content</a>
      <DashboardHeader onToggleNavigation={() => setMobileOpen(value => !value)}>
        <ProfileSelector selectedProfile={selectedProfile} onSelect={switchProfile} onAddGuest={() => setGuestOpen(true)}
          onEditGuest={(id, name) => switchProfile({ type: 'guest', id, name }, ROUTES.AGENT.ASTROLOGY.PROFILE)}
          onDeleteGuest={(id, name) => setGuestToDelete({ id, name })}
          onEditBirth={() => router.push(astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILE, search))}
          onManageProfiles={() => router.push(astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILES, search))} />
      </DashboardHeader>
      <div className="flex min-h-0 flex-1">
        <aside id="observatory-navigation" className="hidden w-60 shrink-0 overflow-y-auto overscroll-y-contain border-r border-border bg-[var(--cosmos-900)] lg:block"><PrimarySidebar /></aside>
        <main id="observatory-content" tabIndex={-1} className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain outline-none">
          <div className="obs-page" key={studentId ? `student:${studentId}` : guestId ? `guest:${guestId}` : 'me'}>
            {selectedProfile.type !== 'me' && <div className="mb-5 flex items-start gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground"><Eye className="mt-0.5 h-4 w-4 shrink-0" /><p><span className="font-medium text-foreground">{selectedProfile.name}</span> · {studentId ? 'Shared chart · birth details are read-only' : 'Guest chart'}</p></div>}
            {pathname !== ROUTES.AGENT.ASTROLOGY.ROOT && <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <li><Link className="inline-flex min-h-8 items-center hover:text-foreground" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.ROOT, search)}>Dashboard</Link></li>
                {topic && <><li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li><li><Link href={astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, search)} className="inline-flex min-h-8 items-center hover:text-foreground">Chart Analysis</Link></li></>}
                {category && <><li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li><li><Link href={`${astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, search)}${studentId || guestId ? '&' : '?'}category=${category.id}`} className="inline-flex min-h-8 items-center hover:text-foreground">{category.title}</Link></li></>}
                <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li><li aria-current="page" className="text-foreground">{topic?.title || pageTitles[pathname] || 'Chart exploration'}</li>
              </ol>
            </nav>}
            {children}
          </div>
        </main>
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="observatory-theme flex w-[min(300px,90vw)] flex-col gap-0 border-border p-0">
          <SheetTitle className="sr-only">Shakti Wheel navigation</SheetTitle>
          <div className="px-7 pb-0 pt-7"><Logo size="sm" href={ROUTES.AGENT.ASTROLOGY.ROOT} /></div>
          <SheetDescription className="sr-only">Navigate your personal observatory.</SheetDescription>
          <div className="min-h-0 flex-1 overflow-y-auto"><PrimarySidebar onNavigate={() => setMobileOpen(false)} /></div>
        </SheetContent>
      </Sheet>
      <GuestProfileDialog isOpen={guestOpen} onClose={() => setGuestOpen(false)} onSuccess={created => switchProfile({ type: 'guest', id: String(created.id), name: created.guest_name || 'Guest' }, ROUTES.AGENT.ASTROLOGY.ROOT)} />
      <ConfirmationDialog isOpen={!!guestToDelete} onClose={() => { if (!deleteGuest.isPending) setGuestToDelete(null); }} title="Delete guest profile?" description={`Delete ${guestToDelete?.name || 'this guest'}’s birth profile? This cannot be undone.`} confirmText="Delete profile" isLoading={deleteGuest.isPending} onConfirm={() => {
        if (!guestToDelete) return;
        deleteGuest.mutate(Number(guestToDelete.id), { onSuccess: () => {
          if (guestId === guestToDelete.id) switchProfile({ type: 'me', name: 'My Chart' }, ROUTES.AGENT.ASTROLOGY.PROFILES);
          setGuestToDelete(null);
        }, onError: () => toast.error('Could not delete this profile. Please try again.') });
      }} />
    </div>
  );
}
