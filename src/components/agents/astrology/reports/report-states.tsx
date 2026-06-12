import { Loader2, RefreshCw, XCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Centered loading spinner
// ---------------------------------------------------------------------------
export function ReportLoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="animate-pulse text-sm text-muted-foreground">Loading your reports…</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state with retry button
// ---------------------------------------------------------------------------
interface ReportErrorStateProps {
  onRetry: () => void;
}

export function ReportErrorState({ onRetry }: ReportErrorStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
      <XCircle className="h-10 w-10 text-destructive/60" />
      <p className="text-sm text-muted-foreground">Failed to load reports. Please try again.</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline "generating" status banner (shown inside the report card)
// ---------------------------------------------------------------------------
export function ReportGeneratingBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary-500/20 bg-primary-500/5 px-4 py-3">
      <Loader2 className="h-5 w-5 animate-spin text-primary-400" />
      <div>
        <p className="text-sm font-medium text-primary-300">Generating your report…</p>
        <p className="text-xs text-muted-foreground">
          This usually takes under 60 seconds. We&apos;ll update automatically.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline "failed" status banner (shown inside the report card)
// ---------------------------------------------------------------------------
interface ReportFailedBannerProps {
  onRefresh: () => void;
}

export function ReportFailedBanner({ onRefresh }: ReportFailedBannerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <XCircle className="h-4 w-4 shrink-0" />
        Report generation failed. Your payment is recorded — please contact support.
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-white/10"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh Status
      </button>
    </div>
  );
}
