'use client';

import { useEffect, useState } from 'react';
import { PaymentResponse, paymentService } from '@/services/payment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import getStripe from '@/lib/stripe';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const stripePromise = getStripe();

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onPaymentSuccess?: (paymentData?: PaymentResponse) => void;
}

function PaymentModalContent({
  isOpen,
  onClose,
  bookingId,
  onPaymentSuccess,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();

  const [paymentMode, setPaymentMode] = useState<'saved' | 'new'>('saved');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');

  const [saveCard, setSaveCard] = useState(false);
  const [isStripeProcessing, setIsStripeProcessing] = useState(false);

  // Fetch saved payment methods
  const {
    data: paymentMethods = [],
    isLoading: isLoadingMethods,
    error: methodsError,
  } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: paymentService.getPaymentMethods,
    enabled: isOpen,
  });

  // Payment mutations
  const savedCardMutation = useMutation({
    mutationFn: paymentService.processPaymentWithSavedCard,
    onSuccess: (data) => {
      toast.success('Payment Successful', {
        description: `Payment of $${data.amount_paid} completed successfully using ${data.card_brand.toUpperCase()} ****${data.card_last4}.`,
      });
      onPaymentSuccess?.(data);
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Unable to process payment. Please try again.';
      toast.error('Payment Failed', {
        description: errorMessage,
      });
    },
  });

  const newCardMutation = useMutation({
    mutationFn: paymentService.processPaymentWithNewCard,
    onSuccess: (data) => {
      toast.success('Payment Successful', {
        description: `Payment of $${data.amount_paid} completed successfully using ${data.card_brand.toUpperCase()} ****${data.card_last4}.`,
      });
      onPaymentSuccess?.(data);
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Unable to process payment. Please try again.';
      toast.error('Payment Failed', {
        description: errorMessage,
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: paymentService.deletePaymentMethod,
    onSuccess: () => {
      toast.success('Card Deleted', {
        description: 'The payment method has been removed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      // Clear selection if the deleted card was selected
      if (paymentMethods.length <= 1) {
        setPaymentMode('new');
        setSelectedPaymentMethod('');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred while deleting the card.';
      toast.error('Failed to delete card', {
        description: errorMessage,
      });
    },
  });

  // Set default payment mode based on available methods
  useEffect(() => {
    if (paymentMethods.length > 0) {
      setPaymentMode('saved');
      if (paymentMethods.length > 0) {
        setSelectedPaymentMethod(paymentMethods[0].stripe_payment_method_id);
      }
    } else {
      setPaymentMode('new');
    }
  }, [paymentMethods]);

  const resetForm = () => {
    setSaveCard(false);
    setSelectedPaymentMethod('');
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }
    }
  };

  const handlePayment = async () => {
    if (paymentMode === 'saved') {
      if (!selectedPaymentMethod) {
        toast.error('Please select a payment method');
        return;
      }

      savedCardMutation.mutate({
        booking_id: parseInt(bookingId),
        saved_payment_method_id: selectedPaymentMethod,
      });
    } else {
      if (!stripe || !elements) {
        toast.error('Stripe has not loaded correctly.');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      setIsStripeProcessing(true);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      setIsStripeProcessing(false);

      if (error) {
        toast.error('Card Error', {
          description: error.message || 'Invalid card details.',
        });
        return;
      }

      if (paymentMethod) {
        newCardMutation.mutate({
          booking_id: parseInt(bookingId),
          payment_method_id: paymentMethod.id,
          save_payment_method: saveCard,
        });
      }
    }
  };

  const isProcessing =
    savedCardMutation.isPending || newCardMutation.isPending || isStripeProcessing;

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.4)',
        },
      },
      invalid: {
        color: '#ff4d4f',
        iconColor: '#ff4d4f',
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-3xl border border-primary-500/10 bg-background p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="flex items-center gap-3 font-serif text-2xl font-bold text-primary-500">
            <CreditCard className="h-6 w-6" />
            Complete Payment
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-primary-100/60">
            Finalize your linguistic investment with secure archival processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-8 pb-8">
          {/* Payment Method Selection */}
          {paymentMethods.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-2 rounded-2xl border border-primary-500/10 bg-white/[0.03] p-1">
                <Button
                  variant={paymentMode === 'saved' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPaymentMode('saved')}
                  disabled={isProcessing}
                  className={cn(
                    'h-9 flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all',
                    paymentMode === 'saved'
                      ? 'bg-primary-500 text-primary-950 hover:bg-primary-600'
                      : 'text-primary-100/40 hover:bg-primary-500/10 hover:text-primary-300'
                  )}
                >
                  Saved Cards
                </Button>
                <Button
                  variant={paymentMode === 'new' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPaymentMode('new')}
                  disabled={isProcessing}
                  className={cn(
                    'h-9 flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all',
                    paymentMode === 'new'
                      ? 'bg-primary-500 text-primary-950 hover:bg-primary-600'
                      : 'text-primary-100/40 hover:bg-primary-500/10 hover:text-primary-300'
                  )}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Card
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingMethods && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent shadow-[0_0_15px_rgba(212,175,55,0.2)]"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                Syncing with stars...
              </p>
            </div>
          )}

          {/* Error State */}
          {methodsError && (
            <div className="py-8 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-destructive">
                Failed to load payment methods. Please try again.
              </p>
            </div>
          )}

          {/* Saved Cards */}
          {paymentMode === 'saved' && paymentMethods.length > 0 && (
            <div className="space-y-3">
              <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">
                Select Payment Method
              </Label>
              <div className="custom-scrollbar max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-300',
                      selectedPaymentMethod === method.stripe_payment_method_id
                        ? 'border-primary-500/40 bg-white/[0.08] shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                        : 'border-primary-500/10 bg-white/[0.03] hover:border-primary-500/20 hover:bg-white/[0.05]'
                    )}
                    onClick={() =>
                      setSelectedPaymentMethod(method.stripe_payment_method_id)
                    }
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                            selectedPaymentMethod ===
                              method.stripe_payment_method_id
                              ? 'border-primary-500/30 bg-primary-500/10 text-primary-500'
                              : 'border-white/10 bg-white/5 text-primary-100/40'
                          )}
                        >
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <div
                            className={cn(
                              'font-bold tracking-wide transition-colors',
                              selectedPaymentMethod ===
                                method.stripe_payment_method_id
                                ? 'text-white'
                                : 'text-primary-100/80'
                            )}
                          >
                            {method.card_brand.toUpperCase()}{' '}
                            <span className="mx-1 text-primary-500/40">•</span>{' '}
                            {method.card_last_four}
                          </div>
                          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-100/30">
                            Expires {method.card_exp_month}/
                            {method.card_exp_year}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCardMutation.mutate(method.stripe_payment_method_id);
                          }}
                          disabled={deleteCardMutation.isPending}
                          className="h-8 w-8 text-primary-100/40 hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        {/* Selection Indicator */}
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                            selectedPaymentMethod ===
                              method.stripe_payment_method_id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-primary-500/20'
                          )}
                        >
                          {selectedPaymentMethod ===
                            method.stripe_payment_method_id && (
                            <div className="h-2 w-2 rounded-full bg-primary-950" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Card Form */}
          {paymentMode === 'new' && (
            <div className="space-y-6">
              <Separator className="bg-primary-500/10" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="cardElement"
                    className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                  >
                    Card Details
                  </Label>
                  <div className="rounded-xl border border-primary-500/10 bg-white/5 p-4">
                    <CardElement options={cardElementOptions} id="cardElement" />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-1">
                  <Checkbox
                    id="saveCard"
                    checked={saveCard}
                    onCheckedChange={(checked) =>
                      setSaveCard(checked as boolean)
                    }
                    disabled={isProcessing}
                    className="rounded-md border-primary-500/30 data-[state=checked]:bg-primary-500 data-[state=checked]:text-primary-950"
                  />
                  <Label
                    htmlFor="saveCard"
                    className="cursor-pointer select-none text-xs text-primary-100/60"
                  >
                    Save this card for future payments
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="h-12 flex-1 rounded-2xl border-primary-500/20 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:bg-primary-500/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="h-12 flex-1 rounded-2xl bg-primary-500 text-[10px] font-bold uppercase tracking-widest text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentModal(props: PaymentModalProps) {
  if (!stripePromise) {
    return null;
  }
  return (
    <Elements stripe={stripePromise}>
      <PaymentModalContent {...props} />
    </Elements>
  );
}
