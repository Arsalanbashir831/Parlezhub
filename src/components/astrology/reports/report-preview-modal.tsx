'use client';

import { FileText, Sparkles, X } from 'lucide-react';

export interface ReportPreviewModalProps {
  url: string;
  isPaid: boolean;
  isInitiatingPayment: boolean;
  onPurchase: () => void;
  onClose: () => void;
}

export function ReportPreviewModal({
  url,
  isPaid,
  isInitiatingPayment,
  onPurchase,
  onClose,
}: ReportPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        className="relative z-10 flex h-[85vh] w-full max-w-4xl flex-col duration-200 animate-in fade-in zoom-in-95"
      >
        <div className="obs-card flex h-full flex-col overflow-hidden text-foreground">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20">
                <FileText className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h2
                  id="preview-modal-title"
                  className="font-semibold text-foreground"
                >
                  Report Preview
                </h2>
                <p className="text-xs text-muted-foreground">
                  Available sample PDF
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isPaid && (
                <button
                  onClick={onPurchase}
                  disabled={isInitiatingPayment}
                  className="obs-button flex items-center gap-1.5 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Buy Full Report
                </button>
              )}
              <button
                onClick={onClose}
                className="obs-control flex h-11 w-11 items-center justify-center text-muted-foreground"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Iframe PDF Viewer */}
          <div className="flex-1 bg-zinc-950">
            <iframe
              src={`${url}#toolbar=0`}
              className="h-full w-full border-none"
              title="Astrology Report Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
