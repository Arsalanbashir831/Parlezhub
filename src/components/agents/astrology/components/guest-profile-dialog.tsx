'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BirthProfileForm from './birth-profile-form';
import type { BirthProfile } from '@/types/astrology';

interface GuestProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: BirthProfile) => void;
}

export function GuestProfileDialog({
  isOpen,
  onClose,
  onSuccess,
}: GuestProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="observatory-theme flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--solar-orange)_25%,transparent)] bg-popover p-0 sm:rounded-2xl">
        <DialogHeader className="shrink-0 border-b border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--solar-orange)_16%,var(--surface-1)),var(--surface-1)_70%)] px-6 py-5 pr-14 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Add a birth profile
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
            Name, date, time and place of birth. We use these to calculate the
            chart.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <BirthProfileForm
            type="guest"
            showHeading={false}
            onSuccess={(profile) => {
              onSuccess?.(profile);
              onClose();
            }}
            className="border-none bg-transparent p-0 shadow-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
