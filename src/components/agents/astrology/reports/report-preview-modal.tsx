'use client';

import React from 'react';
import { X, Sparkles, FileText } from 'lucide-react';

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
        className="relative z-10 flex h-[85vh] w-full max-w-4xl flex-col animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-primary-500/20 bg-background/95 shadow-2xl shadow-primary-900/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-primary-900/40 to-violet-900/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20">
                <FileText className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h2 id="preview-modal-title" className="font-semibold text-white">
                  Report Preview
                </h2>
                <p className="text-xs text-muted-foreground">
                  Free 1-2 page sample PDF
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isPaid && (
                <button
                  onClick={onPurchase}
                  disabled={isInitiatingPayment}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5 hover:shadow-primary-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Buy Full Report
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
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
