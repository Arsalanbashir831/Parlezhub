'use client';

import { usePathname } from 'next/navigation';

import { APPS, appFromPath, authRoutes } from '@/lib/apps';

/** The app the current page belongs to, with its definition and auth URLs. */
export function useCurrentApp() {
  const app = appFromPath(usePathname());
  return { app, definition: APPS[app], routes: authRoutes(app) };
}
