'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BirthProfileForm from './birth-profile-form';

interface GuestProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GuestProfileDialog({
  isOpen,
  onClose,
  onSuccess,
}: GuestProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-primary-500/20 bg-background/95 p-0 backdrop-blur-xl">
        <div className="max-h-[90vh] overflow-y-auto">
          <BirthProfileForm
            type="guest"
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
