'use client';

import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, Lock, Shield, XCircle } from 'lucide-react';

import { useConfirmReportPayment } from '@/hooks/useAstrology';

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: '15px',
      color: '#e2d4f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#6b5d8a' },
      iconColor: '#a78bfa',
    },
    invalid: { color: '#f87171', iconColor: '#f87171' },
  },
} as const;

export interface ReportPaymentFormProps {
  clientSecret: string;
  reportId: number;
  amountCents: number;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Must be rendered as a descendant of a Stripe <Elements> provider.
 * Handles card input → confirmCardPayment → backend confirmation.
 */
export function ReportPaymentForm({
  clientSecret,
  amountCents,
  onSuccess,
  onCancel,
}: ReportPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: confirmPayment, isPending } = useConfirmReportPayment();

  const [cardError, setCardError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const isLoading = processing || isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      setCardError(error.message ?? 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await confirmPayment(paymentIntent.id);
        onSuccess();
      } catch {
        setCardError('Payment was captured but confirmation failed. Please contact support.');
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Amount display */}
      <div className="flex items-center justify-between rounded-xl border border-primary-500/20 bg-primary-500/5 px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">Total due today</span>
        <span className="text-xl font-bold text-primary-400">
          ${(amountCents / 100).toFixed(2)}
        </span>
      </div>

      {/* Stripe card input */}
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/20">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {/* Inline error */}
      {cardError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {cardError}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-green-500" />
        256-bit SSL secured · Powered by Stripe · We never store your card details
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !stripe}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-400 hover:to-violet-400 hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Pay ${(amountCents / 100).toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
