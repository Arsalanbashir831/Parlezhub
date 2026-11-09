import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * The few building blocks every ParlezHub workspace page is made of, so the
 * pages share one rhythm: a header, white panels on the lavender canvas, and
 * one violet action per screen.
 */

export const buttonStyles = {
  /** The one main action on a screen. */
  primary:
    'ph-cta inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-primary-foreground transition-[background-image,opacity] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60',
  /** Everything else. */
  secondary:
    'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
  /** Quiet, inline. */
  ghost:
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
} as const;

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  className,
  children,
  as: Tag = 'section',
  ...rest
}: {
  className?: string;
  children: ReactNode;
  as?: 'section' | 'div' | 'article' | 'aside';
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn('rounded-2xl border border-border bg-card p-5 sm:p-6', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function PanelTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  isLoading,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  hint?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        {isLoading ? (
          <span className="mt-1.5 block h-7 w-12 animate-pulse rounded-md bg-secondary" />
        ) : (
          <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
        )}
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center',
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
      {body && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
}: {
  title: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5"
    >
      <div className="min-w-0">
        <p className="font-bold text-foreground">{title}</p>
        {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={buttonStyles.secondary}>
          Try again
        </button>
      )}
    </div>
  );
}

/** A large tappable tile that leads somewhere: icon, title, one line. */
export function ActionTile({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{body}</span>
      </span>
    </Link>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block animate-pulse rounded-xl bg-secondary', className)}
    />
  );
}
