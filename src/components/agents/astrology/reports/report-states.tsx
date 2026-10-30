import { Loader2, RefreshCw, XCircle } from 'lucide-react';

export function ReportLoadingState() {
  return (
    <div
      role="status"
      className="obs-card flex min-h-[240px] items-center justify-center gap-3 p-6"
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary-400 motion-reduce:animate-none" />
      <p className="text-sm text-muted-foreground">Loading your reports…</p>
    </div>
  );
}

interface ReportErrorStateProps {
  onRetry: () => void;
}
export function ReportErrorState({ onRetry }: ReportErrorStateProps) {
  return (
    <div
      role="alert"
      className="obs-card flex min-h-[200px] flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <XCircle className="h-8 w-8 text-red-400" />
      <p className="text-sm text-muted-foreground">
        Failed to load reports. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="obs-control flex items-center gap-2 px-4 text-sm"
      >
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
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
