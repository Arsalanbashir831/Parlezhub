'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/contexts/user-context';
import {
  availabilityService,
  BookingResponse,
  bookingService,
} from '@/services/availability';
import chatService from '@/services/chat';
import { serviceApi, serviceUtils } from '@/services/service';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

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

    // Fetch teacher services
    const { data: teacherServicesData, isLoading: servicesLoading } = useQuery({
      queryKey: ['teacher-services', teacherId],
      queryFn: async () => {
        if (!teacherId) return [];
        return serviceApi.getTeacherServices(teacherId);
      },
      enabled: Boolean(isOpen && teacherId),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    // Convert teacher services to frontend format
    const teacherServices = useMemo(() => {
      if (!teacherServicesData) return [];
      return teacherServicesData.map(serviceUtils.publicApiResponseToService);
    }, [teacherServicesData]);

    const [date, setDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    // Future-only dates
    const todayStr = useMemo(() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }, []);

    // Auto end time = start + 60 minutes
    const computeEndFromStart = (start: string): string => {
      if (!start) return '';
      const [hh, mm] = start.split(':').map((v) => Number(v));
      const base = new Date(1970, 0, 1, hh, mm, 0);
      base.setMinutes(base.getMinutes() + 60);
      const h = String(base.getHours()).padStart(2, '0');
      const m = String(base.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    useEffect(() => {
      if (startTime) setEndTime(computeEndFromStart(startTime));
      else setEndTime('');
    }, [startTime]);

    // Reset form when dialog closes
    useEffect(() => {
      if (!isOpen) {
        setDate('');
        setStartTime('');
        setEndTime('');
        setSelectedServiceId('');
        setNotes('');
      }
    }, [isOpen]);
    const [submitting, setSubmitting] = useState(false);

    const weekdayFromDate = useMemo(() => {
      if (!date) return undefined;
      // Convert to weekday index Monday=0..Sunday=6
      const jsDate = new Date(date + 'T00:00:00');
      // JS: 0=Sun..6=Sat -> we want 0=Mon..6=Sun
      const jsIdx = jsDate.getDay();
      return (jsIdx + 6) % 7;
    }, [date]);

    const _daySlots = useMemo(() => {
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
      if (!selectedServiceId) {
        toast.error('Please select a service');
        return;
      }

      // Combine date and start time as local time; end is +60 minutes
      const startLocal = new Date(`${date}T${startTime}:00`);
      const endLocal = new Date(startLocal.getTime() + 60 * 60 * 1000);
      const startIso = startLocal.toISOString();
      const endIso = endLocal.toISOString();

      const _toLocal = (iso: string) =>
        new Date(iso).toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

      setSubmitting(true);
      try {
        const booking: BookingResponse = await bookingService.schedule({
          teacher: teacherId,
          gig: parseInt(selectedServiceId),
          start_time: startIso,
          end_time: endIso,
          notes: notes.trim(),
        });

        toast.success('Booking scheduled');

        // Send a booking summary message into the chat
        const selectedService = teacherServices.find(
          (s) => s.id === selectedServiceId
        );

        // Fallback: if service not found in local array, try to find by gig ID from API response
        const serviceFromApi =
          !selectedService && booking.gig
            ? teacherServices.find((s) => parseInt(s.id) === booking.gig)
            : null;

        const serviceInfo = selectedService || serviceFromApi;

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
          `- Service: ${serviceInfo?.title || `Service #${booking.gig || selectedServiceId}`}`,
          `- Status: ${booking.status ?? 'PENDING'}`,
          `- Start: ${toLocal(booking.start_time)}`,
          `- End: ${toLocal(booking.end_time)}`,
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
      } catch {
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
                min={todayStr}
                onChange={(e) => {
                  const val = e.target.value;
                  setDate(val && val < todayStr ? todayStr : val);
                }}
              />
            </div>

            {/* Start (selectable) / End (auto +1h) */}
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
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Service Selection */}
            <div className="grid gap-2">
              <Label htmlFor="booking-service">Select Service</Label>
              {servicesLoading ? (
                <div className="flex h-10 items-center px-3 text-sm text-muted-foreground">
                  Loading services...
                </div>
              ) : teacherServices.length === 0 ? (
                <div className="flex h-10 items-center px-3 text-sm text-muted-foreground">
                  No services available
                </div>
              ) : (
                <Select
                  value={selectedServiceId}
                  onValueChange={setSelectedServiceId}
                >
                  <SelectTrigger id="booking-service">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span className="line-clamp-1 font-medium">
                            {service.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ${service.price} • {service.duration} minutes
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="booking-notes">Notes (optional)</Label>
              <Textarea
                id="booking-notes"
                placeholder="Any specific requirements or topics you'd like to focus on..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting || !date || !startTime || !selectedServiceId
                }
              >
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
