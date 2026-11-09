'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { ParlezhubLogo } from '@/components/parlezhub/brand/logo';

import { AccountSwitcher } from './account-switcher';
import { isLinkActive, isNavGroup, navFor, type NavLink } from './nav';

/**
 * The sidebar's contents: logo, the profile's navigation, and the account
 * switcher at the foot. Rendered in the fixed desktop rail and in the mobile
 * drawer alike, so both always match.
 */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? '';
  const { activeRole } = useAuth();
  const entries = navFor(activeRole === 'TEACHER');

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <ParlezhubLogo href={ROUTES.PARLEZHUB.ROOT} />
      </div>

      <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {entries.map((entry) =>
            isNavGroup(entry) ? (
              <li key={entry.label} className="pt-1">
                <p className="flex items-center gap-3 px-3 pb-1 pt-2 text-sm font-semibold text-muted-foreground">
                  <entry.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {entry.label}
                </p>
                <ul className="ml-5 space-y-1 border-l border-border pl-3">
                  {entry.children.map((link) => (
                    <li key={link.href}>
                      <SidebarLink link={link} pathname={pathname} onNavigate={onNavigate} nested />
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={entry.href}>
                <SidebarLink link={entry} pathname={pathname} onNavigate={onNavigate} />
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <AccountSwitcher />
      </div>
    </div>
  );
}

function SidebarLink({
  link,
  pathname,
  onNavigate,
  nested = false,
}: {
  link: NavLink;
  pathname: string;
  onNavigate?: () => void;
  nested?: boolean;
}) {
  const active = isLinkActive(link, pathname);
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
        nested ? 'h-9' : 'h-10',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      <Icon className={nested ? 'h-4 w-4' : 'h-[18px] w-[18px]'} aria-hidden="true" />
      {link.label}
    </Link>
  );
}
