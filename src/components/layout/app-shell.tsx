'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';

import type { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';
// import ToggleThemeBtn from "@/components/common/toggle-theme-btn";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { AppSidebar } from './app-sidebar';

interface AppShellProps {
  children: React.ReactNode;
  nav: NavItem[];
  roleLabel?: string; // e.g., "Consultant" | "Student"
}

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
    const pathSegment =
      pathname.split('/')[2] || pathname.split('/')[1] || 'dashboard';

    // Check if the current path matches any direct nav item
    const directMatch = nav.find((item) => item.id === pathSegment);
    if (directMatch) {
      return pathSegment;
    }

    // Check if the current path matches any sub-item
    for (const navItem of nav) {
      if (navItem.subItems) {
        const subItemMatch = navItem.subItems.find(
          (subItem) => subItem.id === pathSegment
        );
        if (subItemMatch) {
          return pathSegment; // Return the sub-item id as active
        }
      }
    }

    return pathSegment;
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
      <AppSidebar
        nav={nav}
        activeTab={activeTab}
        roleLabel={roleLabel}
        onLogout={handleLogout}
      />

      <SidebarInset>
        {/* Top bar */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
          <div className="flex h-20 shrink-0 items-center gap-4 px-8">
            <SidebarTrigger className="-ml-2 h-10 w-10 rounded-xl text-primary-50 transition-all hover:bg-white/5" />
            <h1 className="font-serif text-2xl font-bold capitalize tracking-tight text-white">
              {pageTitle}
            </h1>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold text-white leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500">{roleLabel}</p>
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

        {/* Page content */}
        <main
          className={cn(
            'flex flex-1 flex-col gap-4 bg-background',
            roleLabel === 'Agent' ? '' : 'p-4 sm:p-6'
          )}
        >
          <div className="flex-1">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
