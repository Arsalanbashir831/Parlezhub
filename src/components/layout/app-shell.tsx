'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';

import type { NavItem } from '@/types/nav';
import { resolveActiveNav, workspaceMobileTabs } from '@/lib/nav-config';
import { cn } from '@/lib/utils';
// import ToggleThemeBtn from "@/components/common/toggle-theme-btn";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  GuideTourProvider,
} from '@/components/guide/guide-tour-provider';
import {
  WORKSPACE_ANCHORS,
  buildWorkspaceSteps,
  type GuideRole,
} from '@/constants/tour-steps';

import { AppSidebar } from './app-sidebar';
import { MobileTabBar, type MobileTab } from './mobile-tab-bar';

interface AppShellProps {
  children: React.ReactNode;
  nav: NavItem[];
  roleLabel?: string; // e.g., "Consultant" | "Student"
}

const guideRoleForLabel = (roleLabel: string): GuideRole =>
  roleLabel === 'Consultant'
    ? 'consultant'
    : roleLabel === 'Agent'
      ? 'agent'
      : 'student';

/** Lives under SidebarProvider so it can expand a collapsed sidebar before
 *  the first highlight is measured. */
const WorkspaceGuideTour: React.FC<{
  role: GuideRole;
  nav: NavItem[];
  children: React.ReactNode;
}> = ({ role, nav, children }) => {
  const { setOpen } = useSidebar();

  // Stable so the tour callback (and the context value) does not change
  // identity on every shell re-render.
  const prepare = React.useCallback(() => setOpen(true), [setOpen]);
  const buildSteps = React.useCallback(
    () => buildWorkspaceSteps(role, nav),
    [role, nav],
  );

  return (
    <GuideTourProvider
      scope="workspace"
      role={role}
      desktopMinWidth={768}
      autoPrompt={role !== 'agent'}
      prepare={prepare}
      buildSteps={buildSteps}
      promptTitle="New here?"
      promptBody="A one-minute tour of the sidebar, the header and where your main actions live."
    >
      {children}
    </GuideTourProvider>
  );
};

/** Below md the sidebar becomes a sheet; this bar is the way into it ("More")
 *  and to the four sections people use most. Lives under SidebarProvider. */
const WorkspaceMobileNav: React.FC<{
  role: GuideRole;
  nav: NavItem[];
  activeTab: string;
}> = ({ role, nav, activeTab }) => {
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  // A link in the sheet navigates but does not close it on its own.
  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  // The agent shell has a single destination: nothing to tab between.
  if (role === 'agent') return null;

  const tabs: MobileTab[] = workspaceMobileTabs[role].flatMap(({ id, label }) => {
    const item = nav.find((entry) => entry.id === id);
    if (!item?.href) return [];
    return [
      {
        id,
        label,
        href: item.href,
        icon: item.icon,
        badge: item.badge,
        active: activeTab === id,
      },
    ];
  });

  return (
    <MobileTabBar
      tone="workspace"
      tabs={tabs}
      onMore={() => setOpenMobile(true)}
      moreActive={!tabs.some((tab) => tab.active)}
      moreExpanded={openMobile}
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
    />
  );
};

/** The two workspaces read differently — the astrologer's badge is the warm
 *  one, everybody else sits in the neutral shell tone. */
export const RoleBadge: React.FC<{ roleLabel: string }> = ({ roleLabel }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
      roleLabel === 'Consultant'
        ? 'border-primary-500/30 bg-primary-500/10 text-primary-300'
        : 'border-white/10 bg-white/5 text-primary-100/70'
    )}
  >
    <span
      className={cn(
        'h-1.5 w-1.5 rounded-full',
        roleLabel === 'Consultant' ? 'bg-primary-500' : 'bg-primary-100/40'
      )}
      aria-hidden="true"
    />
    {roleLabel}
  </span>
);

export const AppShell: React.FC<AppShellProps> = ({
  children,
  nav,
  roleLabel = 'User',
}) => {
  const pathname = usePathname();
  const { user } = useUser();
  const { logout } = useAuth();
  const router = useRouter();

  const activeTab = React.useMemo(() => {
    const byHref = resolveActiveNav(nav, pathname);
    if (byHref) return byHref;

    // Unknown route (a detail page with no nav entry): the segment keeps the
    // nearest section highlighted, as before.
    return (
      pathname.split('/')[2] || pathname.split('/')[1] || 'dashboard'
    );
  }, [pathname, nav]);

  const pageTitle = React.useMemo(() => {
    // First check sub-items for a more specific title
    for (const navItem of nav) {
      if (navItem.subItems) {
        const subItem = navItem.subItems.find((sub) => sub.id === activeTab);
        if (subItem) {
          return subItem.label;
        }
      }
    }

    // Fall back to main nav item or formatted path segment
    const mainNavItem = nav.find((item) => item.id === activeTab);
    return mainNavItem?.label || activeTab.replace(/-/g, ' ');
  }, [activeTab, nav]);

  const handleLogout = React.useCallback(() => {
    logout();
    router.push(ROUTES.AUTH.LOGIN);
  }, [logout, router]);

  return (
    <SidebarProvider>
      <WorkspaceGuideTour role={guideRoleForLabel(roleLabel)} nav={nav}>
        <AppSidebar
          nav={nav}
          activeTab={activeTab}
          roleLabel={roleLabel}
          onLogout={handleLogout}
        />

        <SidebarInset>
          {/* Top bar */}
          <header
            data-tour={WORKSPACE_ANCHORS.header}
            className="sticky top-0 z-50 shrink-0 border-b border-white/5 bg-background/95"
          >
            <div className="flex h-14 shrink-0 items-center gap-3 px-4 sm:h-16 sm:px-6 md:h-20 md:gap-4 md:px-8">
              {/* Phones reach the sidebar through the tab bar's "More". */}
              <SidebarTrigger data-tour={WORKSPACE_ANCHORS.toggle} className="-ml-2 hidden h-10 w-10 rounded-xl text-primary-50 transition-all hover:bg-white/5 md:inline-flex" />
              <h1 className="min-w-0 truncate font-serif text-lg font-bold capitalize tracking-tight text-white sm:text-xl md:text-2xl">
                {pageTitle}
              </h1>
              <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-4">
                <div className="hidden flex-col items-end gap-1.5 sm:flex">
                  <p className="max-w-[12rem] truncate text-sm font-bold leading-none text-white">{user?.first_name} {user?.last_name}</p>
                  <RoleBadge roleLabel={roleLabel} />
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary-500/20 shadow-lg shadow-primary-500/10 md:h-10 md:w-10">
                  <AvatarImage src={user?.profile_picture ?? undefined} />
                  <AvatarFallback className="bg-primary-500/10 font-serif text-lg font-bold text-primary-500">
                    {user?.first_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Page content — the flex chain (main → wrapper → page) is what lets
              a full-viewport page like Chat fill the space instead of guessing
              the header height with calc(). */}
          <main
            data-tour={WORKSPACE_ANCHORS.content}
            className={cn(
              'flex min-h-0 flex-1 flex-col gap-4 bg-background',
              roleLabel === 'Agent'
                ? ''
                : // Bottom padding clears the fixed phone tab bar (h-16 + home indicator).
                  'px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 md:pb-6'
            )}
          >
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </main>
        </SidebarInset>
        <WorkspaceMobileNav
          role={guideRoleForLabel(roleLabel)}
          nav={nav}
          activeTab={activeTab}
        />
      </WorkspaceGuideTour>
    </SidebarProvider>
  );
};
