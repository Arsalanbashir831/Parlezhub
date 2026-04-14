'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    startTime: string,
    endTime: string,
    reason: string
  ) => Promise<void>;
  isSubmitting: boolean;
  meetingTitle?: string;
}

export default function RescheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  meetingTitle = 'Meeting',
}: RescheduleDialogProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  // Automatically calculate end time (1 hour after start time)
  const calculateEndTime = (startTimeValue: string) => {
    if (!startTimeValue) return '';

    const [hours, minutes] = startTimeValue.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Add 1 hour
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  };

  // Update end time whenever start time changes
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    setEndTime(calculateEndTime(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime || !reason.trim()) {
      return;
    }

    // Convert to ISO strings
    const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

    await onConfirm(startDateTime, endDateTime, reason.trim());

    // Reset form
    setDate('');
    setStartTime('');
    setEndTime('');
    setReason('');
  };

  const handleCancel = () => {
    setDate('');
    setStartTime('');
    setEndTime('');
    setReason('');
    onOpenChange(false);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-primary-500/10 bg-background p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="flex items-center gap-3 font-serif text-2xl font-bold text-primary-500">
            <Calendar className="h-6 w-6" />
            Reschedule {meetingTitle}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-primary-100/60">
            Proposed new alignment for this linguistic cycle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 pb-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
              >
                New Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
                disabled={isSubmitting}
                className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white focus-visible:ring-primary-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="startTime"
                  className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white focus-visible:ring-primary-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="endTime"
                  className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  End Time (1 hour)
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  disabled={true}
                  className="h-12 cursor-not-allowed rounded-xl border-white/5 bg-white/[0.02] text-primary-100/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
              >
                Reason for Rescheduling
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rescheduling..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={isSubmitting}
                rows={3}
                className="resize-none rounded-2xl border-primary-500/10 bg-white/5 p-4 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-2xl border-primary-500/20 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:bg-primary-500/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !date ||
                !startTime ||
                !endTime ||
                !reason.trim()
              }
              className="h-12 flex-1 rounded-2xl bg-primary-500 text-[10px] font-bold uppercase tracking-widest text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
            >
              {isSubmitting ? 'Rescheduling...' : 'Reschedule Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
