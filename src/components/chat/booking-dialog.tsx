'use client';

import { memo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingDialog = memo(({ isOpen, onClose }: BookingDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a Call</DialogTitle>
          <DialogDescription>
            This feature is not available for this contact. Please contact
            support for assistance.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

BookingDialog.displayName = 'BookingDialog';

export default BookingDialog;
