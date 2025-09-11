'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';

import { Meeting } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import PaymentModal from '@/components/chat/payment-modal';

interface MeetingPaymentButtonProps {
  meeting: Meeting;
}

export default function MeetingPaymentButton({
  meeting,
}: MeetingPaymentButtonProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handlePaymentSuccess = () => {
    // Refresh meetings data after successful payment
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['bookings-local'] });
  };

  // Only show for students with confirmed unpaid meetings
  if (meeting.status !== 'CONFIRMED' || meeting.paymentStatus !== 'UNPAID') {
    return null;
  }

  return (
    <>
      <Button
        size="sm"
        variant="default"
        onClick={() => setIsPaymentModalOpen(true)}
        className="bg-green-600 hover:bg-green-700"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Make Payment
      </Button>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingId={meeting.id}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
