'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const LINE_WIDTHS = [
  'w-full',
  'w-11/12',
  'w-4/5',
  'w-3/5',
  'w-2/3',
  'w-5/6',
];

/**
 * Loading placeholders keep the shape of the content that will replace them, so
 * the page does not jump when the API answers.
 */
export function Skeleton({
  className,
  rounded = 'rounded-xl',
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('obs-skeleton', rounded, className)}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn(
            'obs-skeleton h-3 rounded-md',
            LINE_WIDTHS[index % LINE_WIDTHS.length],
            index === lines - 1 && lines > 1 && 'w-2/3'
          )}
        />
      ))}
    </div>
  );
}

/** Wraps a full loading layout so it is announced once, not per block. */
export function LoadingLayout({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('flex min-w-0 flex-col gap-6', className)}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function RequestError({
  title = 'This section could not be loaded',
  message = 'Your saved details have not been changed. Check your connection and try again.',
  onRetry,
  retrying = false,
  retryLabel = 'Try again',
  className,
  children,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  retryLabel?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'obs-card flex min-w-0 flex-col items-start gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6',
        className
      )}
    >
      <div className="flex min-w-0 gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
          {children}
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="obs-control obs-accent shrink-0 gap-2"
        >
          <Loader2
            className={cn('h-4 w-4', retrying ? 'animate-spin' : 'hidden')}
            aria-hidden="true"
          />
          {retrying ? 'Trying again…' : retryLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyNotice({
  title,
  message,
  action,
  className,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'obs-card flex min-w-0 flex-col items-start gap-3 p-5 sm:p-6',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>
      {action}
    </div>
  );
}

/** Background refetch: the content stays, a quiet indicator marks the update. */
export function Refreshing({ label = 'Refreshing…' }: { label?: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-2 text-xs text-[var(--solar-orange)]"
    >
      <Loader2
        className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      {label}
    </p>
  );
}
