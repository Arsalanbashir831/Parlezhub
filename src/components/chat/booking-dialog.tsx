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

    // Calculate duration in minutes between start and end time
    const calculateDuration = (start: string, end: string): number => {
      if (!start || !end) return 0;

      // Handle case where end time is on the next day (e.g., 23:00 to 01:00)
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;

      // If end time is earlier than start time, assume it's the next day
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60; // Add 24 hours
      }

      return endMinutes - startMinutes;
    };

    // Calculate total price based on duration and service rate
    const calculateTotalPrice = (): number => {
      if (!selectedServiceId || !startTime || !endTime) return 0;
      const duration = calculateDuration(startTime, endTime);
      if (duration <= 0) return 0;

      const selectedService = teacherServices.find(
        (s) => s.id === selectedServiceId
      );
      if (!selectedService) return 0;

      // Calculate price based on duration (service price is per hour)
      const hours = duration / 60;
      const totalPrice = selectedService.price * hours;

      // Round to 2 decimal places
      return Math.round(totalPrice * 100) / 100;
    };

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

      const duration = calculateDuration(startTime, endTime);
      if (duration <= 0) {
        toast.error('End time must be after start time');
        return;
      }

      // Combine date and times as local time
      const startLocal = new Date(`${date}T${startTime}:00`);

      // Handle cross-midnight scheduling (e.g., 10 PM to 2 AM)
      let endLocal = new Date(`${date}T${endTime}:00`);

      // If end time is earlier than start time, it means it's the next day
      if (endLocal <= startLocal) {
        // Add one day to the end time
        endLocal = new Date(endLocal.getTime() + 24 * 60 * 60 * 1000);
      }

      const startIso = startLocal.toISOString();
      const endIso = endLocal.toISOString();

      setSubmitting(true);
      try {
        const durationHours = duration / 60; // Convert minutes to hours

        const booking: BookingResponse = await bookingService.schedule({
          teacher: teacherId,
          gig: parseInt(selectedServiceId), // Convert to number as required by API
          start_time: startIso,
          end_time: endIso,
          duration_hours: Math.round(durationHours * 100) / 100, // Round to 2 decimal places
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

        const totalPrice = calculateTotalPrice();
        const summaryDurationHours = duration / 60;

        // Check if booking spans across midnight
        const startDate = new Date(booking.start_time);
        const endDate = new Date(booking.end_time);
        const isNextDay = endDate.getDate() !== startDate.getDate();

        const summary = [
          'Booking Requested',
          `- Service: ${serviceInfo?.title || `Service #${booking.gig || selectedServiceId}`}`,
          `- Status: ${booking.status ?? 'PENDING'}`,
          `- Start: ${toLocal(booking.start_time)}`,
          `- End: ${toLocal(booking.end_time)}${isNextDay ? ' (next day)' : ''}`,
          `- Duration: ${duration} minutes (${Math.round(summaryDurationHours * 100) / 100} hours)`,
          `- Total Amount: $${totalPrice.toFixed(2)}`,
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
        <DialogContent className="overflow-hidden rounded-3xl border border-primary-500/10 bg-background p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="font-serif text-3xl font-bold text-primary-500">
              Schedule Consultation
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-primary-100/60">
              Select a date and time within the teacher&lsquo;s available slots.
              <br />
              <span className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-primary-500/60">
                Note: For sessions that cross midnight (e.g., 10 PM to 2 AM),
                the end time will automatically be set to the next day.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="custom-scrollbar max-h-[70vh] space-y-6 overflow-y-auto px-8 pb-8">
            {/* Weekly schedule overview */}
            <div className="rounded-2xl border border-primary-500/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-300">
                Weekly Availability
              </p>
              {loading && (
                <p className="animate-pulse text-sm text-primary-100/40">
                  Loading...
                </p>
              )}
              {!loading && (
                <ul className="space-y-3">
                  {weeklyGrouped.map((d) => (
                    <li
                      key={d.name}
                      className="flex items-start justify-between gap-4"
                    >
                      <span className="mt-1 min-w-20 text-[11px] font-bold uppercase tracking-widest text-primary-100/60">
                        {d.name.slice(0, 3)}
                      </span>
                      {d.slots.length === 0 ? (
                        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-100/20">
                          Not available
                        </span>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-2">
                          {d.slots.map((s, idx) => (
                            <span
                              key={`${d.name}-${s.start}-${idx}`}
                              className="rounded-lg border border-primary-500/20 bg-primary-500/5 px-2.5 py-1 text-[11px] font-medium text-primary-400"
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

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="booking-date"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  Date
                </Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={date}
                  min={todayStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDate(val && val < todayStr ? todayStr : val);
                  }}
                  className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-white focus-visible:ring-primary-500/30"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="booking-service"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  Visionary Service
                </Label>
                {servicesLoading ? (
                  <div className="flex h-11 items-center rounded-xl border border-primary-500/10 bg-white/5 px-4 text-xs text-primary-100/30">
                    Loading...
                  </div>
                ) : teacherServices.length === 0 ? (
                  <div className="flex h-11 items-center rounded-xl border border-primary-500/10 bg-white/5 px-4 text-xs text-primary-100/30">
                    No services shared
                  </div>
                ) : (
                  <Select
                    value={selectedServiceId}
                    onValueChange={setSelectedServiceId}
                  >
                    <SelectTrigger
                      id="booking-service"
                      className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-white hover:border-primary-500/30 focus:ring-primary-500/30"
                    >
                      <SelectValue placeholder="Choose a field" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary-500/10 bg-background text-white shadow-2xl">
                      {teacherServices.map((service) => (
                        <SelectItem
                          key={service.id}
                          value={service.id}
                          className="focus:bg-primary-500/10 focus:text-primary-500"
                        >
                          <div className="flex flex-col py-1">
                            <span className="line-clamp-1 text-sm font-bold tracking-wide">
                              {service.title}
                            </span>
                            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-400">
                              ${service.price} • {service.duration}m cycle
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="booking-start"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  Start Time
                </Label>
                <Input
                  id="booking-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-white focus-visible:ring-primary-500/30"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="booking-end"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  End Time
                </Label>
                <Input
                  id="booking-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || undefined}
                  className="h-11 rounded-xl border-primary-500/10 bg-white/5 text-white focus-visible:ring-primary-500/30"
                />
                {startTime &&
                  endTime &&
                  calculateDuration(startTime, endTime) <= 0 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">
                      End time must be after start time
                    </p>
                  )}
              </div>
            </div>

            {/* Price Display */}
            {selectedServiceId && startTime && endTime && (
              <div className="relative overflow-hidden rounded-2xl border border-primary-500/20 bg-primary-500/5 p-6">
                <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-primary-500/5 blur-3xl" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-primary-100">
                      {calculateDuration(startTime, endTime)}m
                      {calculateDuration(startTime, endTime) > 0 && (
                        <span className="ml-2 font-medium text-primary-100/40">
                          (
                          {Math.round(
                            (calculateDuration(startTime, endTime) / 60) * 100
                          ) / 100}
                          h)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300">
                      Rate
                    </span>
                    <span className="text-sm font-bold text-primary-100">
                      $
                      {teacherServices.find((s) => s.id === selectedServiceId)
                        ?.price || 0}
                      /h
                    </span>
                  </div>
                  {calculateDuration(startTime, endTime) <= 0 && (
                    <div className="text-center text-[10px] font-bold uppercase tracking-widest text-destructive">
                      End time must be after start time
                    </div>
                  )}
                  <Separator className="bg-primary-500/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500">
                      Total Amount
                    </span>
                    <span className="font-serif text-2xl font-bold text-primary-500 drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                      ${calculateTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="grid gap-2">
              <Label
                htmlFor="booking-notes"
                className="text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
              >
                Notes (optional)
              </Label>
              <Textarea
                id="booking-notes"
                placeholder="Share your constellation details or specific focuses..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none rounded-xl border-primary-500/10 bg-white/5 text-white focus-visible:ring-primary-500/30"
              />
            </div>

            <Separator className="bg-primary-500/10" />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-primary-500/20 px-6 text-primary-400 hover:bg-primary-500/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !date ||
                  !startTime ||
                  !endTime ||
                  !selectedServiceId ||
                  calculateDuration(startTime, endTime) <= 0
                }
                className="rounded-xl bg-primary-500 px-8 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
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
