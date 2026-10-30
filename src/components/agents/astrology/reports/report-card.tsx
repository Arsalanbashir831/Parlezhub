'use client';

import {
  BookOpen,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
} from 'lucide-react';

import { AstrologyReportRecord } from '@/types/astrology';

import { ReportFailedBanner, ReportGeneratingBanner } from './report-states';
import { ReportStatusBadge } from './report-status-badge';

export interface ReportCardProps {
  report: AstrologyReportRecord | undefined;
  profileLabel?: string;
  isInitiatingPayment: boolean;
  isDownloading: boolean;
  onPurchase: () => void;
  onDownload: () => void;
  onRefreshStatus: () => void;
  onViewPreview?: () => void;
}

function displayDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ReportCard({
  report,
  profileLabel,
  isInitiatingPayment,
  isDownloading,
  onPurchase,
  onDownload,
  onRefreshStatus,
  onViewPreview,
}: ReportCardProps) {
  return (
    <article className="obs-card min-w-0 space-y-5 p-5 text-foreground sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <BookOpen className="h-5 w-5 text-primary-400" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="break-words text-lg font-semibold">
              {report?.report_type_display || 'Full Vedic Astrology Report'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {profileLabel || 'Selected birth profile'} · PDF analysis
            </p>
          </div>
        </div>
        <div className="self-start">
          {report ? (
            <ReportStatusBadge status={report.status} isPaid={report.is_paid} />
          ) : (
            <span className="text-xs text-muted-foreground">
              Not generated yet
            </span>
          )}
        </div>
      </div>

      {report ? (
        <dl className="grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="obs-label">Generated</dt>
            <dd className="mt-1 text-muted-foreground">
              {report.generated_at ? (
                <time dateTime={report.generated_at}>
                  {displayDate(report.generated_at)}
                </time>
              ) : (
                'No generation date available'
              )}
            </dd>
          </div>
          <div>
            <dt className="obs-label">Payment</dt>
            <dd className="mt-1 text-muted-foreground">
              {report.is_paid ? 'Paid' : 'Not purchased'}
              {report.paid_at && (
                <>
                  {' '}
                  ·{' '}
                  <time dateTime={report.paid_at}>
                    {displayDate(report.paid_at)}
                  </time>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="obs-label">Generation status</dt>
            <dd className="mt-1 capitalize text-muted-foreground">
              {report.status}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          No report record is available for this profile yet. Checkout will show
          the price before you confirm payment.
        </p>
      )}

      {report?.preview_content && (
        <section className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" /> Sample excerpt
          </h3>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {report.preview_content}
          </p>
        </section>
      )}

      <div className="flex flex-col gap-3">
        {report?.preview_url && onViewPreview && (
          <button
            type="button"
            onClick={onViewPreview}
            className="obs-control flex w-full items-center justify-center gap-2 px-4 text-sm"
          >
            <Eye className="h-4 w-4" /> View PDF sample
          </button>
        )}
        {!report?.is_paid ? (
          <button
            type="button"
            onClick={onPurchase}
            disabled={isInitiatingPayment}
            className="obs-button flex w-full items-center justify-center gap-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInitiatingPayment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing checkout…
              </>
            ) : (
              <>
                Get full report <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        ) : report.status === 'generating' ? (
          <ReportGeneratingBanner />
        ) : report.status === 'ready' ? (
          <>
            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading || !report.download_url}
              className="obs-button flex w-full items-center justify-center gap-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Downloading…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Download PDF report
                </>
              )}
            </button>
            {!report.download_url && (
              <p className="text-sm text-muted-foreground">
                The report is marked ready, but a download is not available yet.
              </p>
            )}
          </>
        ) : report.status === 'failed' ? (
          <ReportFailedBanner onRefresh={onRefreshStatus} />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Payment recorded. Report generation is pending.
            </p>
            <button
              type="button"
              onClick={onRefreshStatus}
              className="obs-control flex items-center gap-2 px-4 text-sm"
            >
              <RefreshCw className="h-4 w-4" /> Refresh status
            </button>
          </div>
        )}
        {!report?.is_paid && (
          <p className="flex items-start justify-center gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> One-time purchase ·
            Secure Stripe checkout · Price confirmed before payment
          </p>
        )}
      </div>
    </article>
  );
}
