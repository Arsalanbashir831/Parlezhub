'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reschedule {meetingTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">New Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time (1 hour duration)</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  disabled={true}
                  className="cursor-not-allowed bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Rescheduling</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rescheduling..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
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
              className="flex-1"
            >
              {isSubmitting ? 'Rescheduling...' : 'Reschedule Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
