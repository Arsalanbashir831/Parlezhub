'use client';

import { BookOpen, ChevronRight, Download, Lock, Loader2, RefreshCw, Sparkles, Eye, FileText } from 'lucide-react';

import { AstrologyReportRecord } from '@/types/astrology';
import { cn } from '@/lib/utils';
import { ReportStatusBadge } from './report-status-badge';
import {
  ReportGeneratingBanner,
  ReportFailedBanner,
} from './report-states';

export interface ReportCardProps {
  /** The existing report record from the API, or undefined if no report has been created yet */
  report: AstrologyReportRecord | undefined;
  /** Whether the "purchase" CTA is currently initiating a PaymentIntent */
  isInitiatingPayment: boolean;
  /** Whether a download is in progress for this report's type */
  isDownloading: boolean;
  onPurchase: () => void;
  onDownload: () => void;
  onRefreshStatus: () => void;
  onViewPreview?: () => void;
}

export function ReportCard({
  report,
  isInitiatingPayment,
  isDownloading,
  onPurchase,
  onDownload,
  onRefreshStatus,
  onViewPreview,
}: ReportCardProps) {
  const isPaidAndReady = report?.status === 'ready' && report.is_paid;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300',
        isPaidAndReady
          ? 'border-green-500/30 bg-gradient-to-br from-green-950/10 to-background/50'
          : 'border-primary-500/15 bg-gradient-to-br from-primary-950/10 to-background/50',
      )}
    >
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-primary-500/0 transition-all duration-500 group-hover:bg-primary-500/[0.02]" />

      <div className="relative flex flex-col gap-6">
        {/* ── Title row ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/10 border border-primary-500/20">
              <BookOpen className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight text-white">
                {report?.report_type_display ?? 'Full Vedic Astrology Report'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {report?.generated_at
                  ? `Generated ${new Date(report.generated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}`
                  : 'Complete 20+ page personalized cosmic analysis'}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto">
            <ReportStatusBadge
              status={report?.status ?? 'pending'}
              isPaid={report?.is_paid ?? false}
            />
          </div>
        </div>

        {/* ── Preview excerpt ── */}
        {report?.preview_content && (
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.01] p-5">
            {/* Decorative top-right corner fold */}
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-tr-xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary-400/70" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400/70">
                Sample Excerpt
              </span>
            </div>
            
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground/80 pl-3 border-l border-primary-500/30">
              {report.preview_content}
            </p>
          </div>
        )}

        {/* ── CTA area — driven by report state ── */}
        <div className="flex flex-col gap-3">
          {!report || !report.is_paid ? (
            // Not purchased yet
            <div className="flex flex-col gap-3 sm:flex-row">
              {report?.preview_url && onViewPreview && (
                <button
                  type="button"
                  onClick={onViewPreview}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary-500/20 bg-primary-500/5 px-6 py-3.5 text-sm font-semibold text-primary-400 transition-all hover:bg-primary-500/10 hover:border-primary-500/40 active:scale-98"
                >
                  <Eye className="h-4 w-4" />
                  View PDF Sample
                </button>
              )}
              <button
                type="button"
                onClick={onPurchase}
                disabled={isInitiatingPayment}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-98 disabled:cursor-not-allowed disabled:opacity-60",
                  report?.preview_url ? "flex-1" : "w-full"
                )}
              >
                {isInitiatingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing Secure Checkout…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-primary-200" />
                    Get Full Report — $9.99
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          ) : report.status === 'generating' ? (
            <ReportGeneratingBanner />
          ) : report.status === 'ready' ? (
            // Paid + ready → download
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/30 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading Report…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF Report
                </>
              )}
            </button>
          ) : report.status === 'failed' ? (
            <ReportFailedBanner onRefresh={onRefreshStatus} />
          ) : null}

          {/* Secure purchase lock text */}
          {!report?.is_paid && (
            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60 mt-1">
              <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span>One-time payment · Instant lifetime access · Secure checkout via Stripe</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
