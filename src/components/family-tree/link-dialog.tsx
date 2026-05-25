'use client';

import { useState, useTransition } from 'react';
import { Link2, Check, Heart } from 'lucide-react';
import { FamilyMember } from '@/types/family-tree';
import { cn } from '@/lib/utils';

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

interface LinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  source: FamilyMember | null;
  target: FamilyMember | null;
  onSubmit: (type: 'parent' | 'spouse') => Promise<void>;
}

export function LinkDialog({
  isOpen,
  onOpenChange,
  source,
  target,
  onSubmit,
}: LinkDialogProps) {
  const [linkType, setLinkType] = useState<'parent' | 'spouse'>('parent');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!source || !target) return;
    startTransition(async () => {
      try {
        await onSubmit(linkType);
      } catch (err: unknown) {
        console.error('Failed to create relationship:', err);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-primary-500/20 bg-background/95 backdrop-blur-xl text-primary-100 shadow-2xl text-center">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-1">
            <Link2 className="h-6 w-6 text-primary-500" />
          </div>
          <DialogTitle className="font-serif text-lg font-bold text-primary-500 text-center">
            Connect Relationship
          </DialogTitle>
          {source && target && (
            <DialogDescription className="text-primary-100/60 text-xs text-center leading-relaxed">
              Establish a connection between{' '}
              <span className="font-extrabold text-primary-100">
                {"\""}
                {source.name}
                {"\""}
              </span>{' '}
              and{' '}
              <span className="font-extrabold text-primary-100">
                {"\""}
                {target.name}
                {"\""}
              </span>
              .
            </DialogDescription>
          )}
        </DialogHeader>

        {source && target && (
          <div className="space-y-4 mt-2">
            <div className="space-y-3">
              <Button
                onClick={() => setLinkType('parent')}
                variant={linkType === 'parent' ? 'default' : 'outline'}
                disabled={isPending}
                className={cn(
                  'w-full py-6 px-4 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between',
                  linkType === 'parent'
                    ? 'bg-primary-500 text-primary-950 border-primary-500 shadow-md hover:bg-primary-600'
                    : 'border-primary-500/20 bg-white/[0.02] text-primary-300 hover:bg-white/[0.05]'
                )}
              >
                <span className="truncate">
                  {"\""}
                  {target.name}
                  {"\""} is Parent of {"\""}
                  {source.name}
                  {"\""}
                </span>
                {linkType === 'parent' && <Check className="h-4 w-4 shrink-0" />}
              </Button>

              <Button
                onClick={() => setLinkType('spouse')}
                variant={linkType === 'spouse' ? 'default' : 'outline'}
                disabled={isPending}
                className={cn(
                  'w-full py-6 px-4 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between',
                  linkType === 'spouse'
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md hover:bg-pink-600'
                    : 'border-primary-500/20 bg-white/[0.02] text-primary-300 hover:bg-white/[0.05]'
                )}
              >
                <span>Married to / Spouse Connection</span>
                <Heart
                  className={cn(
                    'h-4 w-4 shrink-0',
                    linkType === 'spouse' ? 'fill-white text-white' : 'text-primary-100/40'
                  )}
                />
              </Button>
            </div>

            <div className="flex gap-3 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="flex-1 border-white/10 bg-white/5 text-primary-100 hover:bg-white/10 text-xs font-bold"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 bg-primary-500 text-primary-950 hover:bg-primary-600 text-xs font-extrabold shadow-lg shadow-primary-500/10 disabled:opacity-50"
              >
                {isPending ? 'Connecting...' : 'Connect Link'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
