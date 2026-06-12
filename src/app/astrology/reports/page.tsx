'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useReports, useInitiateReportPayment } from '@/hooks/useAstrology';
import { AstrologyReportRecord, InitiateReportPaymentResponse } from '@/types/astrology';
import { API_ROUTES } from '@/constants/api-routes';
import apiCaller from '@/lib/api-caller';

import { ReportPageHeader } from '@/components/agents/astrology/reports/report-page-header';
import { ReportCard } from '@/components/agents/astrology/reports/report-card';
import { ReportIncludedPanel } from '@/components/agents/astrology/reports/report-included-panel';
import { ReportTrustPanel } from '@/components/agents/astrology/reports/report-trust-panel';
import { ReportPaymentModal } from '@/components/agents/astrology/reports/report-payment-modal';
import { ReportLoadingState, ReportErrorState } from '@/components/agents/astrology/reports/report-states';
import { ReportPreviewModal } from '@/components/agents/astrology/reports/report-preview-modal';

export default function AstrologyReportsPage() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get('guest_id') || undefined;

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: reports,
    isLoading,
    isError,
    refetch,
  } = useReports(guestId ? Number(guestId) : undefined);

  const { mutateAsync: initiatePayment, isPending: isInitiating } = useInitiateReportPayment();

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [paymentData, setPaymentData] = useState<InitiateReportPaymentResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

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
        toast.success('Already purchased!', { description: 'Your report is ready to download.' });
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
        { responseType: 'blob' },
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

  // ── Derived state ──────────────────────────────────────────────────────────
  const fullReport = reports?.find((r) => r.report_type === 'full');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-w-0 flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-10 md:p-8">
      <ReportPageHeader />

      {isLoading ? (
        <ReportLoadingState />
      ) : isError ? (
        <ReportErrorState onRetry={refetch} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left column — report card(s) */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <ReportCard
              report={fullReport}
              isInitiatingPayment={isInitiating}
              isDownloading={isDownloading === 'full'}
              onPurchase={handlePurchase}
              onDownload={() => fullReport && handleDownload(fullReport)}
              onRefreshStatus={refetch}
              onViewPreview={() => fullReport?.preview_url && setActivePreviewUrl(fullReport.preview_url)}
            />
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
      {activePreviewUrl && (
        <ReportPreviewModal
          url={activePreviewUrl}
          isPaid={fullReport?.is_paid ?? false}
          isInitiatingPayment={isInitiating}
          onPurchase={handlePurchase}
          onClose={() => setActivePreviewUrl(null)}
        />
      )}
    </div>
  );
}
