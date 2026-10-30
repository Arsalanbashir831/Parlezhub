'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/api-routes';
import { toast } from 'sonner';

import {
  AstrologyReportRecord,
  InitiateReportPaymentResponse,
} from '@/types/astrology';
import apiCaller from '@/lib/api-caller';
import {
  useBirthProfile,
  useInitiateReportPayment,
  useReports,
} from '@/hooks/useAstrology';
import { ReportCard } from '@/components/agents/astrology/reports/report-card';
import { ReportIncludedPanel } from '@/components/agents/astrology/reports/report-included-panel';
import { ReportPageHeader } from '@/components/agents/astrology/reports/report-page-header';
import { ReportPaymentModal } from '@/components/agents/astrology/reports/report-payment-modal';
import { ReportPreviewModal } from '@/components/agents/astrology/reports/report-preview-modal';
import {
  ReportErrorState,
  ReportLoadingState,
} from '@/components/agents/astrology/reports/report-states';
import { ReportTrustPanel } from '@/components/agents/astrology/reports/report-trust-panel';

export default function AstrologyReportsPage() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get('guest_id') || undefined;
  // The existing reports API supports personal or guest birth profiles only.
  const { data: birthProfile } = useBirthProfile(undefined, guestId);
  const profileLabel =
    birthProfile?.guest_name ||
    birthProfile?.user_name ||
    (guestId
      ? `Guest birth profile #${guestId}`
      : 'Your personal birth profile');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: reports,
    isLoading,
    isError,
    refetch,
  } = useReports(guestId ? Number(guestId) : undefined);

  const { mutateAsync: initiatePayment, isPending: isInitiating } =
    useInitiateReportPayment();

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [paymentData, setPaymentData] =
    useState<InitiateReportPaymentResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<{
    report: AstrologyReportRecord;
    profileId?: string;
  } | null>(null);

  // ── Auto-poll while a report is being generated ───────────────────────────
  const hasGenerating = reports?.some((r) => r.status === 'generating');
  useEffect(() => {
    if (!hasGenerating) return;
    const id = setInterval(() => refetch(), 5000);
    return () => clearInterval(id);
  }, [hasGenerating, refetch]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePurchase = useCallback(async () => {
    try {
      const data = await initiatePayment({
        report_type: 'full',
        birth_profile_id: guestId ? Number(guestId) : undefined,
      });

      // Already purchased — skip modal and refresh list
      if (data.already_purchased && data.download_url) {
        toast.success('Already purchased!', {
          description: 'Your report is ready to download.',
        });
        refetch();
        return;
      }

      setPaymentData(data);
    } catch {
      // Error toast handled by the mutation hook
    }
  }, [initiatePayment, guestId, refetch]);

  const handleDownload = useCallback(async (report: AstrologyReportRecord) => {
    if (!report.download_url) return;
    setIsDownloading(report.report_type);
    try {
      const response = await apiCaller(
        API_ROUTES.ASTROLOGY.REPORT_DOWNLOAD(report.report_type),
        'GET',
        undefined,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vedic-astrology-report.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed', {
        description: 'Could not retrieve your report. Please try again.',
      });
    } finally {
      setIsDownloading(null);
    }
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setPaymentData(null);
    refetch();
  }, [refetch]);

  const handleCloseModal = useCallback(() => {
    setPaymentData(null);
  }, []);

  // Sort only the records returned by the API; do not invent a report history.
  const sortedReports = useMemo(
    () =>
      [...(reports ?? [])].sort((a, b) => {
        const dateFor = (report: AstrologyReportRecord) => {
          const timestamp = new Date(
            report.generated_at || report.paid_at || ''
          ).getTime();
          return Number.isFinite(timestamp) ? timestamp : 0;
        };
        return dateFor(b) - dateFor(a);
      }),
    [reports]
  );
  const previewReport =
    activePreview?.profileId === guestId && activePreview
      ? (sortedReports.find(
          (report) => report.id === activePreview.report.id
        ) ?? activePreview.report)
      : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-w-0 flex-col gap-6 text-foreground">
      <ReportPageHeader profileLabel={profileLabel} />

      {isLoading ? (
        <ReportLoadingState />
      ) : isError ? (
        <ReportErrorState onRetry={refetch} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left column — report card(s) */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {sortedReports.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {sortedReports.length} available report record
                {sortedReports.length === 1 ? '' : 's'} · Newest available date
                first
              </p>
            )}
            {(sortedReports.length ? sortedReports : [undefined]).map(
              (report) => (
                <ReportCard
                  key={report?.id ?? 'new-report'}
                  report={report}
                  profileLabel={profileLabel}
                  isInitiatingPayment={isInitiating}
                  isDownloading={isDownloading === report?.report_type}
                  onPurchase={handlePurchase}
                  onDownload={() => report && handleDownload(report)}
                  onRefreshStatus={refetch}
                  onViewPreview={() =>
                    report?.preview_url &&
                    setActivePreview({ report, profileId: guestId })
                  }
                />
              )
            )}
          </div>

          {/* Right column — sidebar panels */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <ReportIncludedPanel />
            <ReportTrustPanel />
          </div>
        </div>
      )}

      {/* Payment modal — rendered at root level to escape stacking contexts */}
      {paymentData && (
        <ReportPaymentModal
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
          onClose={handleCloseModal}
        />
      )}

      {/* Preview modal */}
      {previewReport?.preview_url && (
        <ReportPreviewModal
          url={previewReport.preview_url}
          isPaid={previewReport.is_paid}
          isInitiatingPayment={isInitiating}
          onPurchase={handlePurchase}
          onClose={() => setActivePreview(null)}
        />
      )}
    </div>
  );
}
