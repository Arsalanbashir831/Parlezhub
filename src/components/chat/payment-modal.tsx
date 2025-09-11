'use client';

import { useEffect, useState } from 'react';
import { PaymentResponse, paymentService } from '@/services/payment';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Method Selection */}
          {paymentMethods.length > 0 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={paymentMode === 'saved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMode('saved')}
                  disabled={isProcessing}
                >
                  Saved Cards
                </Button>
                <Button
                  variant={paymentMode === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMode('new')}
                  disabled={isProcessing}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New Card
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingMethods && (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
            </div>
          )}

          {/* Error State */}
          {methodsError && (
            <div className="py-4 text-center text-sm text-red-600">
              Failed to load payment methods. Please try again.
            </div>
          )}

          {/* Saved Cards */}
          {paymentMode === 'saved' && paymentMethods.length > 0 && (
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.stripe_payment_method_id
                      ? 'ring-primary ring-2'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() =>
                    setSelectedPaymentMethod(method.stripe_payment_method_id)
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {method.card_brand.toUpperCase()} ••••{' '}
                            {method.card_last_four}
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires {method.card_exp_month}/
                            {method.card_exp_year}
                          </div>
                        </div>
                      </div>
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300">
                        {selectedPaymentMethod ===
                          method.stripe_payment_method_id && (
                          <div className="bg-primary h-2 w-2 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* New Card Form */}
          {paymentMode === 'new' && (
            <div className="space-y-4">
              <Separator />

              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    disabled={isProcessing}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="expMonth">Month</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="expYear">Year</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
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
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveCard"
                    checked={saveCard}
                    onCheckedChange={(checked) =>
                      setSaveCard(checked as boolean)
                    }
                    disabled={isProcessing}
                  />
                  <Label htmlFor="saveCard" className="text-sm">
                    Save this card for future payments
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
