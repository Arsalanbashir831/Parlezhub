'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/user-context';
import chatService from '@/services/chat';

import { Button } from '@/components/ui/button';

import PaymentModal from './payment-modal';

export default function PaymentBookingAction({
  fields,
}: {
  fields: Record<string, string>;
}) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { user } = useUser();
  const bookingId = fields['Booking ID'];

  if (!bookingId) return null;

  const handlePaymentSuccess = () => {
    // Send simple success message
    const simpleSuccessMessage =
      '🎉 Payment is successful! Your booking is now confirmed.';

    // Send locally for immediate feedback
    chatService.appendLocal(simpleSuccessMessage, user?.id);
    // Also send via socket to notify the teacher
    if (chatService.isConnected()) {
      chatService.sendMessage(simpleSuccessMessage);
    }
  };

  return (
    <>
      <div className="mt-4">
        <Button
          size="sm"
          variant="default"
          onClick={() => setIsPaymentModalOpen(true)}
          className="h-9 rounded-xl bg-primary-500 px-6 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
        >
          Make Payment
        </Button>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
          Payment required to confirm your booking
        </p>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingId={bookingId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
