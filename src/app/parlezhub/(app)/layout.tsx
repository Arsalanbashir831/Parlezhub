'use client';

import { useState } from 'react';
import { Loader2, Menu } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { APPS } from '@/lib/apps';
import RoleGuard from '@/components/auth/role-guard';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ParlezhubLogo } from '@/components/parlezhub/brand/logo';
import { SidebarContent } from '@/components/parlezhub/layout/sidebar';

/**
 * The signed-in ParlezHub workspace: a fixed sidebar on desktop, a top bar with
 * a drawer on phones. Any role may enter; the sidebar shows the active
 * profile's navigation, and pages that belong to one profile guard themselves.
 * The guard sends a signed-out visitor to ParlezHub's sign-in and a roleless
 * account to its onboarding.
 *
 * The main area's padding is mirrored by `.ph-fill` in parlezhub.css; change
 * them together.
 */
export default function ParlezhubAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={['STUDENT', 'TEACHER', 'BOTH']}>
      <a
        href="#ph-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/95 px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
        </button>
        <ParlezhubLogo href={ROUTES.PARLEZHUB.ROOT} />
      </header>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-72 border-r border-border bg-card p-0 sm:max-w-72">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarContent onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <main
          id="ph-main"
          className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-10 lg:py-8"
        >
          {children}
        </main>
      </div>

      <RoleSwitchOverlay />
    </RoleGuard>
  );
}

/** Switching or opening a profile reloads the whole workspace; say so. */
function RoleSwitchOverlay() {
  const { isRoleSwitching } = useAuth();
  if (!isRoleSwitching) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-8 py-7 text-center shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="font-bold text-foreground">Switching profile</p>
        <p className="text-sm text-muted-foreground">
          Opening your {APPS.parlezhub.name} workspace…
        </p>
      </div>
    </div>
  );
}
