'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { UserPlus, Edit3, Trash2 } from 'lucide-react';
import { FamilyMember } from '@/types/family-tree';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

interface MemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  member?: FamilyMember | null;
  onSubmit: (payload: {
    name: string;
    gender: 'male' | 'female' | 'other' | null;
    birth_date: string | null;
    birth_time: string | null;
    birth_place: string | null;
  }) => Promise<void>;
  onDelete?: (uuid: string) => Promise<void>;
}

export function MemberDialog({
  isOpen,
  onOpenChange,
  mode,
  member,
  onSubmit,
  onDelete,
}: MemberDialogProps) {
  // Form states
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>('male');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isPending, startTransition] = useTransition();

  // Sync form states with member when editing
  useEffect(() => {
    if (mode === 'edit' && member) {
      setName(member.name);
      setGender(member.gender);
      setBirthDate(member.birth_date || '');
      setBirthTime(member.birth_time ? member.birth_time.slice(0, 5) : '');
      setBirthPlace(member.birth_place || '');
    } else {
      setName('');
      setGender('male');
      setBirthDate('');
      setBirthTime('');
      setBirthPlace('');
    }
  }, [mode, member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          name: name.trim(),
          gender,
          birth_date: birthDate || null,
          birth_time: birthTime ? `${birthTime}:00` : null,
          birth_place: birthPlace || null,
        };
        await onSubmit(payload);
      } catch (err: unknown) {
        console.error('Failed to submit member details:', err);
      }
    });
  };

  const handleDelete = () => {
    if (!onDelete || !member) return;
    startTransition(async () => {
      try {
        await onDelete(member.id);
      } catch (err: unknown) {
        console.error('Failed to delete member:', err);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-primary-500/20 bg-background/95 backdrop-blur-xl text-primary-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-primary-500 flex items-center gap-2">
            {mode === 'create' ? <UserPlus className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
            {mode === 'create' ? 'Add Family Member' : 'Edit Family Member'}
          </DialogTitle>
          <DialogDescription className="text-primary-100/45 text-xs">
            {mode === 'create'
              ? 'Add a new family member to your standalone tree.'
              : 'Modify family member information or remove them completely.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              Full Name *
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zainab Bashir"
              disabled={isPending}
              className="border-primary-500/20 bg-white/[0.03] text-primary-100 placeholder:text-primary-100/25 focus-visible:ring-primary-500/30 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              Gender
            </label>
            <div className="flex gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={gender === g ? 'default' : 'outline'}
                  disabled={isPending}
                  onClick={() => setGender(g)}
                  className={cn(
                    'flex-1 text-xs font-semibold capitalize',
                    gender === g
                      ? 'bg-primary-500 text-primary-950 hover:bg-primary-600 shadow-md'
                      : 'border-primary-500/20 bg-white/[0.03] text-primary-300 hover:bg-white/[0.05]'
                  )}
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                Birth Date
              </label>
              <Input
                type="date"
                value={birthDate}
                disabled={isPending}
                onChange={(e) => setBirthDate(e.target.value)}
                className="border-primary-500/20 bg-white/[0.03] text-primary-100 focus-visible:ring-primary-500/30 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                Birth Time
              </label>
              <Input
                type="time"
                value={birthTime}
                disabled={isPending}
                onChange={(e) => setBirthTime(e.target.value)}
                className="border-primary-500/20 bg-white/[0.03] text-primary-100 focus-visible:ring-primary-500/30 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              Birth Place
            </label>
            <Input
              type="text"
              value={birthPlace}
              disabled={isPending}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="e.g. Lahore, Pakistan"
              className="border-primary-500/20 bg-white/[0.03] text-primary-100 placeholder:text-primary-100/25 focus-visible:ring-primary-500/30 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-3">
            {mode === 'edit' && member && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 text-xs font-bold transition-transform active:scale-95 duration-200 flex items-center justify-center gap-1.5 animate-fade-in"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Member
              </Button>
            ) : (
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
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-primary-500 text-primary-950 hover:bg-primary-600 font-extrabold shadow-lg shadow-primary-500/10 text-xs disabled:opacity-50"
            >
              {isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
