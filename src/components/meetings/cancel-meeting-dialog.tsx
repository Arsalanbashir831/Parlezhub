'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/user-context';

import { Meeting } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type CancelMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, shouldRefund: boolean) => void | Promise<void>;
  isSubmitting?: boolean;
  meeting?: Meeting | null;
  activeTab?: string;
};

export default function CancelMeetingDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  meeting,
  activeTab,
}: CancelMeetingDialogProps) {
  const [reason, setReason] = useState('');
  const { user } = useUser();

  // Check if this cancellation should trigger a refund
  const shouldRefund =
    activeTab === 'upcoming' &&
    meeting?.paymentStatus === 'PAID' &&
    meeting?.paymentId &&
    meeting?.amountPaid;

  // Get role-specific refund messaging
  const getRefundMessage = () => {
    if (!shouldRefund || !meeting?.amountPaid) return null;

    const amount = meeting.amountPaid.toFixed(2);

    if (user?.role === 'TEACHER') {
      return `⚠️ This will process a refund of $${amount} to the student's payment method.`;
    } else {
      return `⚠️ This will also process a refund of $${amount} to your payment method.`;
    }
  };

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel meeting</DialogTitle>
          <DialogDescription>
            Please provide a brief reason for cancelling this meeting.
            {getRefundMessage() && (
              <span className="mt-2 block font-medium text-amber-600">
                {getRefundMessage()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Reason</label>
          <Textarea
            placeholder="Personal emergency, schedule conflict, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason.trim(), !!shouldRefund)}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting
              ? shouldRefund
                ? user?.role === 'TEACHER'
                  ? 'Cancelling & Processing Refund...'
                  : 'Cancelling & Refunding...'
                : 'Cancelling...'
              : shouldRefund
                ? user?.role === 'TEACHER'
                  ? 'Cancel & Process Refund'
                  : 'Cancel & Refund'
                : 'Confirm Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
