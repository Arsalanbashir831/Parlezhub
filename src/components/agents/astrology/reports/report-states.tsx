import { Loader2, RefreshCw, XCircle } from 'lucide-react';

import {
  LoadingLayout,
  RequestError,
  Skeleton,
  SkeletonText,
} from '@/components/agents/astrology/ui/observatory-state';

/** Mirrors the reports page: a column of report cards beside the two side panels. */
export function ReportLoadingState() {
  return (
    <LoadingLayout
      label="Loading your reports…"
      className="grid gap-6 lg:grid-cols-5"
    >
      <div className="flex flex-col gap-4 lg:col-span-3">
        {[0, 1].map((row) => (
          <div
            key={row}
            aria-hidden="true"
            className="obs-card min-w-0 space-y-5 p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Skeleton className="h-11 w-11 shrink-0" rounded="rounded-xl" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-44 max-w-full" rounded="rounded-md" />
                  <Skeleton className="h-3 w-32 max-w-full" rounded="rounded-md" />
                </div>
              </div>
              <Skeleton className="h-7 w-24 shrink-0" rounded="rounded-full" />
            </div>
            <SkeletonText lines={3} />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-36" rounded="rounded-xl" />
              <Skeleton className="h-10 w-28" rounded="rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 lg:col-span-2">
        {[0, 1].map((row) => (
          <div key={row} aria-hidden="true" className="obs-card space-y-4 p-5">
            <Skeleton className="h-4 w-40 max-w-full" rounded="rounded-md" />
            <SkeletonText lines={4} />
          </div>
        ))}
      </div>
    </LoadingLayout>
  );
}

interface ReportErrorStateProps {
  onRetry: () => void;
  retrying?: boolean;
}
export function ReportErrorState({
  onRetry,
  retrying = false,
}: ReportErrorStateProps) {
  return (
    <RequestError
      title="Your reports could not be loaded"
      message="Purchases and generated files stay on your account. The service did not answer, so this list is empty rather than partly wrong."
      onRetry={onRetry}
      retrying={retrying}
    />
  );
}

export function ReportGeneratingBanner() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4"
    >
      <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary-400 motion-reduce:animate-none" />
      <div>
        <p className="text-sm font-medium text-foreground">
          Generating your report…
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Status refreshes automatically every 5 seconds while generation is in
          progress. You can return later to download it.
        </p>
      </div>
    </div>
  );
}

interface ReportFailedBannerProps {
  onRefresh: () => void;
}
export function ReportFailedBanner({ onRefresh }: ReportFailedBannerProps) {
  return (
    <div className="space-y-3">
      <div
        role="alert"
        className="flex items-start gap-2 rounded-xl border border-red-400/30 p-4 text-sm leading-relaxed text-red-400"
      >
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> Report generation
        failed. Your payment is recorded; please contact support if refreshing
        does not resolve the status.
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="obs-control flex items-center gap-2 px-4 text-sm"
      >
        <RefreshCw className="h-4 w-4" /> Refresh status
      </button>
    </div>
  );
}
