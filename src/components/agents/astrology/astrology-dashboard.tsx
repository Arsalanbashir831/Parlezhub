'use client';

import { useEffect, useState } from 'react';
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
  useNatalChart,
  useTransits,
} from '@/hooks/useAstrology';
import { ScrollArea } from '@/components/ui/scroll-area';

import InsightView from './analysis/insight-view';
import ShareAccessView from './analysis/share-access-view';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import AstroDetailsTable from './components/astro-details-table';
import AstroHeader from './components/astro-header';
import BirthProfileForm from './components/birth-profile-form';
import { DashboardHeader } from './components/dashboard-header';
import { FloatingFooter } from './components/floating-footer';
import { GuestProfileDialog } from './components/guest-profile-dialog';
import { NavataraEducationView } from './components/navatara-education-view';
import { ProfileSelector, SelectedProfile } from './components/profile-selector';
import VedicChart from './components/vedic-chart';
import AnalysisSidebar from './layout/analysis-sidebar';
import NavigationSidebar from './layout/navigation-sidebar';

// Map icons manually since the const only has emoji
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

export default function AstrologyDashboard({
  studentId: initialStudentId,
  readOnly: initialReadOnly = false,
}: {
  studentId?: string;
  readOnly?: boolean;
}) {
  const { activeRole } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(
    'd1-chart'
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Profile selection state
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile>(
    initialStudentId
      ? { type: 'student', id: initialStudentId, name: 'Student' }
      : { type: 'me', name: 'My Chart' }
  );
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string } | null>(null);

  const currentStudentId = selectedProfile.type === 'student' ? selectedProfile.id : undefined;
  const currentGuestId = selectedProfile.type === 'guest' ? selectedProfile.id : undefined;

  // TEACHER can edit their own profiles ('me') and 'guest' profiles.
  // STUDENTS are read-only for teachers.
  // initialReadOnly is a master override from props (e.g. settings Page)
  const isReadOnly = initialReadOnly || selectedProfile.type === 'student';

  // API Hooks
  const { data: profile, isLoading: isProfileLoading } = useBirthProfile(currentStudentId, currentGuestId);
  const { data: natalChart, isLoading: isChartLoading } = useNatalChart(
    true,
    currentStudentId,
    currentGuestId
  );
  const { data: transits, isLoading: isTransitsLoading } = useTransits(
    true,
    currentStudentId,
    currentGuestId
  );
  const { mutate: deleteGuest } = useDeleteGuestProfile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (id: string) => {
    setActiveAnalysis(id);
    setLeftOpen(false);
    setRightOpen(false);
  };

  const handleProfileChange = (profile: SelectedProfile) => {
    setSelectedProfile(profile);
  };

  const handleAddGuest = () => {
    setIsGuestDialogOpen(true);
  };

  const handleEditGuest = (id: string, name: string) => {
    setSelectedProfile({ type: 'guest', id, name });
    setActiveAnalysis('birth-profile');
  };

  const handleDeleteGuest = (id: string, name: string) => {
    setGuestToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!guestToDelete) return;
    deleteGuest(Number(guestToDelete.id), {
      onSuccess: () => {
        if (selectedProfile.type === 'guest' && selectedProfile.id === guestToDelete.id) {
          setSelectedProfile({ type: 'me', name: 'My Chart' });
        }
        setIsDeleteDialogOpen(false);
        setGuestToDelete(null);
      }
    });
  };

  if (!mounted || isProfileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const displayUsername = profile?.guest_name || profile?.user_name || selectedProfile.name || 'Seeker';

  const welcomeMessage = selectedProfile.type !== 'me'
    ? `Viewing: ${displayUsername}`
    : `Welcome, ${displayUsername}`;

  const renderLeftSidebar = () => (
    <AnalysisSidebar
      activeAnalysis={activeAnalysis}
      onSelect={handleSelect}
      iconMap={ICON_MAP}
      readOnly={isReadOnly}
    />
  );

  const renderRightSidebar = () => (
    <NavigationSidebar
      activeAnalysis={activeAnalysis}
      onSelect={handleSelect}
      iconMap={ICON_MAP}
      transits={transits?.transits}
      readOnly={isReadOnly}
    />
  );

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
            onAddGuest={handleAddGuest}
            onEditGuest={handleEditGuest}
            onDeleteGuest={handleDeleteGuest}
          />
        )}
      </DashboardHeader>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
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

        {/* Center Canvas */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="h-full flex-1 bg-white/5 backdrop-blur-sm">
            {!profile ? (
              <BirthProfileForm
                type={selectedProfile.type}
                studentId={currentStudentId}
                guestProfileId={currentGuestId}
              />
            ) : isChartLoading || isTransitsLoading || !natalChart ? (
              <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
              </div>
            ) : activeAnalysis === 'birth-profile' ? (
              <div className="flex h-full w-full items-center justify-center">
                <BirthProfileForm
                  type={selectedProfile.type}
                  readOnly={isReadOnly}
                  studentId={currentStudentId}
                  guestProfileId={currentGuestId}
                />
              </div>
            ) : // Active Analysis checks
              activeAnalysis === 'd1-chart' ||
                activeAnalysis === 'd9-chart' ||
                !activeAnalysis ? (
                <div className="flex min-w-0 flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-10 md:p-8">
                  <AstroHeader
                    username={welcomeMessage}
                    moonSign={natalChart.moon_sign || 'N/A'}
                    sunSign={natalChart.sun_sign || 'N/A'}
                    ascendant={natalChart.ascendant?.rashi || 'N/A'}
                    birthNakshatra={natalChart.nakshatra || 'N/A'}
                    nakshatraRuler={
                      natalChart.planets.find(
                        (p) => p.nakshatra === natalChart.nakshatra
                      )?.nakshatra_lord || 'N/A'
                    }
                  />

                  <div className="relative flex flex-col items-center justify-center gap-12 py-4 md:gap-16 md:py-10">
                    <div className="flex w-full min-w-0 max-w-full justify-center px-2">
                      <div className="w-full max-w-[600px]">
                        <VedicChart
                          title={
                            activeAnalysis === 'd9-chart'
                              ? 'D9 NAVAMSA'
                              : 'D1 CHART'
                          }
                          natalPlanets={
                            activeAnalysis === 'd9-chart'
                              ? natalChart.d9_chart?.positions
                              : natalChart.d1_chart?.positions
                          }
                          transitPlanets={
                            activeAnalysis === 'd1-chart' && transits
                              ? transits.transits
                              : []
                          }
                          className="h-auto w-full"
                        />
                      </div>
                    </div>
                    <div className="mx-auto w-full min-w-0 max-w-full px-2">
                      <AstroDetailsTable
                        grahaDetails={
                          activeAnalysis === 'd9-chart'
                            ? natalChart.d9_chart?.graha_details
                            : natalChart.d1_chart?.graha_details
                        }
                        bhavaDetails={
                          activeAnalysis === 'd9-chart'
                            ? natalChart.d9_chart?.bhava_details
                            : natalChart.d1_chart?.bhava_details
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : activeAnalysis === 'share-access' ? (
                selectedProfile.type !== 'me' ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="font-serif text-lg text-slate-500">
                      Sharing access is restricted in read-only mode.
                    </p>
                  </div>
                ) : (
                  <ShareAccessView onBack={() => setActiveAnalysis('d1-chart')} />
                )
              ) : activeAnalysis === 'navatara' ? (
                <div className="flex w-full flex-col p-4 duration-500 animate-in fade-in md:p-8">
                  <NavataraEducationView
                    studentId={currentStudentId}
                    guestProfileId={currentGuestId}
                    onClose={() => setActiveAnalysis('d1-chart')}
                  />
                </div>
              ) : (
                <InsightView
                  slug={activeAnalysis}
                  onBack={() => setActiveAnalysis('d1-chart')}
                  studentId={currentStudentId}
                  guestProfileId={currentGuestId}
                />
              )}
          </ScrollArea>
        </main>

        {/* Right Sidebar Menu */}
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

      {/* Mobile Floating Actions */}
      <FloatingFooter
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        rightOpen={rightOpen}
        setRightOpen={setRightOpen}
        renderLeftSidebar={renderLeftSidebar}
        renderRightSidebar={renderRightSidebar}
      />

      {/* Modals */}
      <GuestProfileDialog
        isOpen={isGuestDialogOpen}
        onClose={() => setIsGuestDialogOpen(false)}
        onSuccess={() => {
          setActiveAnalysis('d1-chart');
        }}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Guest Profile"
        description={`Are you sure you want to delete ${guestToDelete?.name}'s profile? This action cannot be undone and will remove all birth data and generated insights.`}
        confirmText="Delete Profile"
        variant="destructive"
      />
    </div>
  );
}
