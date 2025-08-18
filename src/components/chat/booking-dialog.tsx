'use client';

import { memo, useMemo, useState } from 'react';
import { useUser } from '@/contexts/user-context';
import { availabilityService, bookingService } from '@/services/availability';
import chatService from '@/services/chat';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

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
import { Separator } from '@/components/ui/separator';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId?: string;
}

const BookingDialog = memo(
  ({ isOpen, onClose, teacherId }: BookingDialogProps) => {
    const { user } = useUser();
    const { data: weeklyItems, isLoading: loading } = useQuery({
      queryKey: ['weekly-availability', teacherId],
      queryFn: async () => {
        if (!teacherId)
          return [] as Awaited<
            ReturnType<typeof availabilityService.getWeekly>
          >;
        return availabilityService.getWeekly(teacherId);
      },
      enabled: Boolean(isOpen && teacherId),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const [date, setDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const weekdayFromDate = useMemo(() => {
      if (!date) return undefined;
      // Convert to weekday index Monday=0..Sunday=6
      const jsDate = new Date(date + 'T00:00:00');
      // JS: 0=Sun..6=Sat -> we want 0=Mon..6=Sun
      const jsIdx = jsDate.getDay();
      return (jsIdx + 6) % 7;
    }, [date]);

    const daySlots = useMemo(() => {
      if (weekdayFromDate === undefined)
        return [] as Array<{ start: string; end: string }>;
      const weekly = (weeklyItems || []).map((i) => ({
        dayIndex: i.day_of_week,
        start: i.start_time,
        end: i.end_time,
      }));
      return weekly
        .filter((w) => w.dayIndex === weekdayFromDate)
        .map((w) => ({ start: w.start.slice(0, 5), end: w.end.slice(0, 5) }));
    }, [weeklyItems, weekdayFromDate]);

    const weeklyGrouped = useMemo(() => {
      const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];
      const result: Array<{
        name: string;
        slots: Array<{ start: string; end: string }>;
      }> = days.map((_, idx) => ({ name: days[idx], slots: [] }));
      const weekly = (weeklyItems || []).map((i) => ({
        dayIndex: i.day_of_week,
        start: i.start_time,
        end: i.end_time,
      }));
      weekly.forEach((w) => {
        const start = w.start.slice(0, 5);
        const end = w.end.slice(0, 5);
        result[w.dayIndex]?.slots.push({ start, end });
      });
      return result;
    }, [weeklyItems]);

    const handleSubmit = async () => {
      if (!teacherId) return;
      if (!date || !startTime || !endTime) {
        toast.error('Please select date, start and end time');
        return;
      }

      // Combine date and time as local time (user's timezone)
      const startLocal = new Date(`${date}T${startTime}:00`);
      const endLocal = new Date(`${date}T${endTime}:00`);
      const startIso = startLocal.toISOString();
      const endIso = endLocal.toISOString();

      const toLocal = (iso: string) =>
        new Date(iso).toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

      setSubmitting(true);
      try {
        const booking = await bookingService.schedule({
          teacher: teacherId,
          start_time: startIso,
          end_time: endIso,
          session_type: 'video_call',
          notes: '',
        });

        toast.success('Booking scheduled');

        // Send a booking summary message into the chat
        const toLocal = (iso: string) =>
          new Date(iso).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        const summary = [
          'Booking Requested',
          `- Status: ${booking.status ?? 'PENDING'}`,
          `- Start: ${toLocal(booking.start_time)}`,
          `- End: ${toLocal(booking.end_time)}`,
          // URLs are intentionally omitted until approval
          `- Booking ID: ${booking.id}`,
        ]
          .filter(Boolean)
          .join('\n');
        // Always append locally so the sender sees it immediately
        chatService.appendLocal(summary, user?.id);
        // Also send over socket for the other participant
        if (chatService.isConnected()) {
          chatService.sendMessage(summary);
        }

        onClose();
      } catch (e) {
        toast.error('Failed to schedule booking');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule a session</DialogTitle>
            <DialogDescription>
              Select a date and time within the teacher&lsquo;s available slots.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Weekly schedule overview */}
            <div className="rounded-md border p-3">
              <p className="mb-2 text-sm font-medium">Weekly availability</p>
              {loading && (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
              {!loading && (
                <ul className="space-y-2">
                  {weeklyGrouped.map((d) => (
                    <li
                      key={d.name}
                      className="flex items-start justify-between gap-2"
                    >
                      <span className="min-w-24 text-sm font-medium">
                        {d.name}
                      </span>
                      {d.slots.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          Not available
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {d.slots.map((s, idx) => (
                            <span
                              key={`${d.name}-${s.start}-${idx}`}
                              className="rounded border px-2 py-0.5 text-xs"
                            >
                              {s.start} - {s.end}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="booking-date">Date</Label>
              <Input
                id="booking-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Recommended slots for selected day */}
            {date && (
              <div className="rounded-md border p-3">
                <p className="mb-2 text-sm font-medium">Available slots</p>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : daySlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No slots for this day. You can still request a time.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {daySlots.map((s, idx) => (
                      <li key={`${s.start}-${idx}`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStartTime(s.start);
                            setEndTime(s.end);
                          }}
                        >
                          {s.start} - {s.end}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Start/End */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="booking-start">Start time</Label>
                <Input
                  id="booking-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="booking-end">End time</Label>
                <Input
                  id="booking-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Schedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

BookingDialog.displayName = 'BookingDialog';

export default BookingDialog;
