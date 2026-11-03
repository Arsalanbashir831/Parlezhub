'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';

import type { NavItem } from '@/types/nav';
import { resolveActiveNav } from '@/lib/nav-config';
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
  const pathname = usePathname();

  // Stable so the tour callback (and the context value) does not change
  // identity on every shell re-render.
  const prepare = React.useCallback(() => setOpen(true), [setOpen]);
  const buildSteps = React.useCallback(
    () => buildWorkspaceSteps(role, nav, pathname),
    [role, nav, pathname],
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
            <div className="flex h-20 shrink-0 items-center gap-4 px-8">
              <SidebarTrigger data-tour={WORKSPACE_ANCHORS.toggle} className="-ml-2 h-10 w-10 rounded-xl text-primary-50 transition-all hover:bg-white/5" />
              <h1 className="font-serif text-2xl font-bold capitalize tracking-tight text-white">
                {pageTitle}
              </h1>
              <div className="ml-auto flex items-center gap-4">
                <div className="flex flex-col items-end gap-1.5">
                  <p className="text-sm font-bold text-white leading-none">{user?.first_name} {user?.last_name}</p>
                  <RoleBadge roleLabel={roleLabel} />
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary-500/20 shadow-lg shadow-primary-500/10">
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
              roleLabel === 'Agent' ? '' : 'p-4 sm:p-6'
            )}
          >
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </main>
        </SidebarInset>
      </WorkspaceGuideTour>
    </SidebarProvider>
  );
};
