'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/user-context';

import { cn } from '@/lib/utils';
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
      <DialogContent className="overflow-hidden rounded-3xl border border-primary-500/10 bg-background p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="font-serif text-2xl font-bold text-primary-500">
            Cancel Meeting
          </DialogTitle>
          <DialogDescription className="font-medium text-primary-100/60">
            Please provide a brief reason for cancelling this meeting.
            {getRefundMessage() && (
              <span className="mt-3 block rounded-xl border border-primary-500/20 bg-primary-500/5 p-3 text-xs font-bold tracking-tight text-primary-400">
                {getRefundMessage()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-8 pb-4">
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">
              Reason
            </label>
            <Textarea
              placeholder="Personal emergency, schedule conflict, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none rounded-2xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 p-8 pt-4 sm:justify-center">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-12 flex-1 rounded-2xl border border-primary-500/10 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:bg-primary-500/10"
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason.trim(), !!shouldRefund)}
            disabled={!reason.trim() || isSubmitting}
            className={cn(
              'h-12 flex-[2] rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95',
              'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
            )}
          >
            {isSubmitting
              ? shouldRefund
                ? user?.role === 'TEACHER'
                  ? 'Processing Refund...'
                  : 'Refunding...'
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
