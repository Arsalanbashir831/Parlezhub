'use client';

import { CreditCard } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { InitiateReportPaymentResponse } from '@/types/astrology';
import { ReportPaymentForm } from './report-payment-form';

// Singleton — instantiated once so the Stripe.js script is loaded only once
// regardless of how many times the modal mounts/unmounts.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STRIPE_APPEARANCE = { theme: 'night' } as const;

export interface ReportPaymentModalProps {
  paymentData: InitiateReportPaymentResponse;
  onSuccess: () => void;
  onClose: () => void;
}

export function ReportPaymentModal({ paymentData, onSuccess, onClose }: ReportPaymentModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
        aria-labelledby="payment-modal-title"
        className="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="overflow-hidden rounded-2xl border border-primary-500/20 bg-background/95 shadow-2xl shadow-primary-900/40">
          {/* Modal header */}
          <div className="border-b border-white/5 bg-gradient-to-r from-primary-900/40 to-violet-900/20 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20">
                <CreditCard className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h2 id="payment-modal-title" className="font-semibold">
                  Complete Your Purchase
                </h2>
                <p className="text-xs text-muted-foreground">
                  {paymentData.report_type === 'full'
                    ? 'Full Vedic Astrology Report'
                    : paymentData.report_type}
                </p>
              </div>
            </div>
          </div>

          {/* Modal body — <Elements> must wrap the form */}
          <div className="p-6">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: paymentData.client_secret,
                appearance: STRIPE_APPEARANCE,
              }}
            >
              <ReportPaymentForm
                clientSecret={paymentData.client_secret}
                reportId={paymentData.report_id}
                amountCents={paymentData.amount_cents}
                onSuccess={onSuccess}
                onCancel={onClose}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}
