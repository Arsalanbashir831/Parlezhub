'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Brain,
  Briefcase,
  CloudMoon,
  Compass,
  Contrast,
  Crown,
  FileText,
  Flame,
  Gem,
  Handshake,
  Hospital,
  Hourglass,
  Landmark,
  LifeBuoy,
  Moon,
  Orbit,
  Sparkles,
  Star,
  Theater,
  Tornado,
  Users,
} from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import {
  useBirthProfile,
  useDeleteGuestProfile,
  useTransits,
} from '@/hooks/useAstrology';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { DashboardHeader } from '@/components/agents/astrology/components/dashboard-header';
import { FloatingFooter } from '@/components/agents/astrology/components/floating-footer';
import { GuestProfileDialog } from '@/components/agents/astrology/components/guest-profile-dialog';
import { ProfileSelector, SelectedProfile } from '@/components/agents/astrology/components/profile-selector';
import { FloatingAIAstrologer } from '@/components/agents/astrology/components/floating-ai-astrologer';
import AnalysisSidebar from '@/components/agents/astrology/layout/analysis-sidebar';
import NavigationSidebar from '@/components/agents/astrology/layout/navigation-sidebar';
import { ROUTES } from '@/constants/routes';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '✨': Sparkles,
  '🪐': Orbit,
  '⭐': Star,
  '🧭': Compass,
  '☸️': LifeBuoy,
  '🌙': Moon,
  '💎': Gem,
  '🔥': Flame,
  '📜': FileText,
  '🌌': CloudMoon,
  '🌀': Tornado,
  '👑': Crown,
  '🏛️': Landmark,
  '☯️': Contrast,
  '🧠': Brain,
  '💼': Briefcase,
  '🏥': Hospital,
  '⏳': Hourglass,
  '👥': Users,
  '🎭': Theater,
  '🤝': Handshake,
};

export default function AstrologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeRole } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Profile selection state from URL
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  const selectedProfile = useMemo((): SelectedProfile => {
    if (studentId) return { type: 'student', id: studentId, name: 'Student' };
    if (guestId) return { type: 'guest', id: guestId, name: 'Guest' };
    return { type: 'me', name: 'My Chart' };
  }, [studentId, guestId]);

  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string } | null>(null);

  const transitDate = searchParams.get('transit_date') || undefined;
  const { data: profile } = useBirthProfile(studentId, guestId);
  const { data: transits } = useTransits(true, studentId, guestId, transitDate);
  const { mutate: deleteGuest } = useDeleteGuestProfile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProfileChange = (profile: SelectedProfile) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('student_id');
    params.delete('guest_id');

    if (profile.type === 'student') params.set('student_id', profile.id!);
    if (profile.type === 'guest') params.set('guest_id', profile.id!);

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelect = (id: string) => {
    setLeftOpen(false);
    setRightOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    if (id !== 'dashboard') {
      params.delete('chart_type');
    }

    // Mapping internal IDs to routes
    const routeMap: Record<string, string> = {
      'dashboard': ROUTES.AGENT.ASTROLOGY.ROOT,
      'navatara': ROUTES.AGENT.ASTROLOGY.NAVATARA,
      'birth-profile': ROUTES.AGENT.ASTROLOGY.PROFILE,
      'share-access': ROUTES.AGENT.ASTROLOGY.SHARE,
      'dasha': ROUTES.AGENT.ASTROLOGY.DASHA,
    };

    if (routeMap[id]) {
      router.push(`${routeMap[id]}?${params.toString()}`);
    } else {
      // Default to dynamic insights route for all other analysis items
      router.push(`${ROUTES.AGENT.ASTROLOGY.INSIGHTS(id)}?${params.toString()}`);
    }
  };

  const confirmDelete = () => {
    if (!guestToDelete) return;
    deleteGuest(Number(guestToDelete.id), {
      onSuccess: () => {
        if (guestId === guestToDelete.id) {
          handleProfileChange({ type: 'me', name: 'My Chart' });
        }
        setIsDeleteDialogOpen(false);
        setGuestToDelete(null);
      }
    });
  };

  const activeAnalysis = useMemo(() => {
    if (pathname === ROUTES.AGENT.ASTROLOGY.ROOT) return 'dashboard';
    if (pathname === ROUTES.AGENT.ASTROLOGY.NAVATARA) return 'navatara';
    if (pathname === ROUTES.AGENT.ASTROLOGY.PROFILE) return 'birth-profile';
    if (pathname === ROUTES.AGENT.ASTROLOGY.SHARE) return 'share-access';
    if (pathname === ROUTES.AGENT.ASTROLOGY.DASHA) return 'dasha';
    if (pathname.includes(ROUTES.AGENT.ASTROLOGY.INSIGHTS(''))) {
      const slug = pathname.split('/').pop();
      return slug || null;
    }
    return null;
  }, [pathname]);

  const isReadOnly = useMemo(() => {
    return selectedProfile.type === 'student';
  }, [selectedProfile]);

  if (!mounted) return null;

  const displayUsername = profile?.guest_name || profile?.user_name || selectedProfile.name || 'Seeker';

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground selection:bg-primary-500/10">
      {selectedProfile.type !== 'me' && (
        <div className="sticky top-0 z-[60] flex w-full items-center justify-between gap-4 border-b border-primary-100 bg-primary-50/80 px-4 py-2 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-900 md:text-sm">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary-500" />
            Viewing {displayUsername}&apos;s Chart — {selectedProfile.type === 'guest' ? 'Guest Profile' : 'Read-Only Mode'}
          </div>
        </div>
      )}

      <DashboardHeader>
        {activeRole === 'TEACHER' && (
          <ProfileSelector
            selectedProfile={selectedProfile}
            onSelect={handleProfileChange}
            onAddGuest={() => setIsGuestDialogOpen(true)}
            onEditGuest={(id, name) => {
              handleProfileChange({ type: 'guest', id, name });
              router.push(`/astrology/profile?${searchParams.toString()}`);
            }}
            onDeleteGuest={(id, name) => {
              setGuestToDelete({ id, name });
              setIsDeleteDialogOpen(true);
            }}
          />
        )}
      </DashboardHeader>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {profile && (
          <div className="hidden duration-300 animate-in slide-in-from-left-full xl:block">
            <AnalysisSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              readOnly={isReadOnly}
              className="w-64 border-r border-primary-300/60 bg-background/40 backdrop-blur-xl xl:w-72 2xl:w-80"
            />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="h-full w-full flex-1 bg-white/5 backdrop-blur-sm">
            {children}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </main>

        {profile && (
          <div className="hidden duration-300 animate-in slide-in-from-right-full xl:block">
            <NavigationSidebar
              activeAnalysis={activeAnalysis}
              onSelect={handleSelect}
              iconMap={ICON_MAP}
              className="w-64 border-l border-primary-300/60 bg-background/40 backdrop-blur-xl xl:w-72 2xl:w-80"
              transits={transits?.transits}
              readOnly={isReadOnly}
              isPersonal={selectedProfile.type === 'me'}
            />
          </div>
        )}
      </div>

      <FloatingFooter
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        rightOpen={rightOpen}
        setRightOpen={setRightOpen}
        renderLeftSidebar={() => (
          <AnalysisSidebar
            activeAnalysis={activeAnalysis}
            onSelect={handleSelect}
            iconMap={ICON_MAP}
            readOnly={isReadOnly}
          />
        )}
        renderRightSidebar={() => (
          <NavigationSidebar
            activeAnalysis={activeAnalysis}
            onSelect={handleSelect}
            iconMap={ICON_MAP}
            transits={transits?.transits}
            readOnly={isReadOnly}
          />
        )}
      />

      <GuestProfileDialog
        isOpen={isGuestDialogOpen}
        onClose={() => setIsGuestDialogOpen(false)}
        onSuccess={() => {
          // Redirect to chart after creation? 
          // Handled by user feedback usually
        }}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Guest Profile"
        description={`Are you sure you want to delete ${guestToDelete?.name}'s profile?`}
        confirmText="Delete Profile"
        variant="destructive"
      />

      {profile && !studentId && (
        <FloatingAIAstrologer
          category={activeAnalysis === 'dashboard' ? 'd1-chart' : (activeAnalysis || 'd1-chart')}
          studentId={studentId}
          guestProfileId={guestId}
        />
      )}
    </div>
  );
}
