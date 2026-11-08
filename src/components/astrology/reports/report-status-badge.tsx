import { CheckCircle2, Clock, Loader2, Lock, XCircle } from 'lucide-react';
import { ReportStatus } from '@/types/astrology';

interface StatusBadgeProps {
  status: ReportStatus | 'pending';
  isPaid: boolean;
}

export function ReportStatusBadge({ status, isPaid }: StatusBadgeProps) {
  if (!isPaid) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
        <Lock className="h-3 w-3" />
        Purchase Required
      </span>
    );
  }

  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Ready to Download
      </span>
    );
  }

  if (status === 'generating') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Generating…
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
        <XCircle className="h-3 w-3" />
        Generation Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}
