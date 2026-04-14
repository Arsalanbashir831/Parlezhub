'use client';

import { useEffect, useState } from 'react';
import { PaymentResponse, paymentService } from '@/services/payment';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onPaymentSuccess?: (paymentData?: PaymentResponse) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [paymentMode, setPaymentMode] = useState<'saved' | 'new'>('saved');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');

  // New card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

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
    onError: (error: Error) => {
      toast.error('Payment Failed', {
        description:
          error?.message || 'Unable to process payment. Please try again.',
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
    onError: (error: Error) => {
      toast.error('Payment Failed', {
        description:
          error?.message || 'Unable to process payment. Please try again.',
      });
    },
  });

  // Set default payment mode based on available methods
  useEffect(() => {
    if (paymentMethods.length > 0) {
      setPaymentMode('saved');
      setSelectedPaymentMethod(paymentMethods[0].stripe_payment_method_id);
    } else {
      setPaymentMode('new');
    }
  }, [paymentMethods]);

  const resetForm = () => {
    setCardNumber('');
    setExpMonth('');
    setExpYear('');
    setCvc('');
    setCardholderName('');
    setSaveCard(false);
    setSelectedPaymentMethod('');
  };

  const handlePayment = () => {
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
      // Validate new card form
      if (!cardNumber || !expMonth || !expYear || !cvc || !cardholderName) {
        toast.error('Please fill in all card details');
        return;
      }

      newCardMutation.mutate({
        booking_id: parseInt(bookingId),
        card_number: cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(expMonth),
        exp_year: parseInt(expYear),
        cvc,
        cardholder_name: cardholderName,
        save_payment_method: saveCard,
      });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const isProcessing = savedCardMutation.isPending || newCardMutation.isPending;

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
                    htmlFor="cardNumber"
                    className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                  >
                    Card Number
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500/40" />
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      disabled={isProcessing}
                      maxLength={19}
                      className="h-11 rounded-xl border-primary-500/10 bg-white/5 pl-11 text-white focus-visible:ring-primary-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="expMonth"
                      className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                    >
                      Month
                    </Label>
                    <Input
                      id="expMonth"
                      placeholder="MM"
                      value={expMonth}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (
                          value.length <= 2 &&
                          (value === '' ||
                            (parseInt(value) >= 1 && parseInt(value) <= 12))
                        ) {
                          setExpMonth(value);
                        }
                      }}
                      disabled={isProcessing}
                      maxLength={2}
                      className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-center text-white focus-visible:ring-primary-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="expYear"
                      className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                    >
                      Year
                    </Label>
                    <Input
                      id="expYear"
                      placeholder="YYYY"
                      value={expYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setExpYear(value);
                        }
                      }}
                      disabled={isProcessing}
                      maxLength={4}
                      className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-center text-white focus-visible:ring-primary-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cvc"
                      className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                    >
                      CVC
                    </Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setCvc(value);
                        }
                      }}
                      disabled={isProcessing}
                      maxLength={4}
                      className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-center text-white focus-visible:ring-primary-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="cardholderName"
                    className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                  >
                    Cardholder Name
                  </Label>
                  <Input
                    id="cardholderName"
                    placeholder="E.g. John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    disabled={isProcessing}
                    className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-white focus-visible:ring-primary-500/30"
                  />
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
