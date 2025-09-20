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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule a session</DialogTitle>
            <DialogDescription>
              Select a date and time within the teacher&lsquo;s available slots.
              <br />
              <span className="text-xs text-muted-foreground">
                Note: For sessions that cross midnight (e.g., 10 PM to 2 AM),
                the end time will automatically be set to the next day.
              </span>
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
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || undefined}
                />
                {startTime &&
                  endTime &&
                  calculateDuration(startTime, endTime) <= 0 && (
                    <p className="text-xs text-destructive">
                      End time must be after start time
                    </p>
                  )}
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

            {/* Price Display */}
            {selectedServiceId && startTime && endTime && (
              <div className="rounded-md border bg-muted/50 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">
                      {calculateDuration(startTime, endTime)} minutes
                      {calculateDuration(startTime, endTime) > 0 && (
                        <span className="ml-1 text-muted-foreground">
                          (
                          {Math.round(
                            (calculateDuration(startTime, endTime) / 60) * 100
                          ) / 100}{' '}
                          hours)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rate:</span>
                    <span className="text-sm">
                      $
                      {teacherServices.find((s) => s.id === selectedServiceId)
                        ?.price || 0}
                      /hour
                    </span>
                  </div>
                  {calculateDuration(startTime, endTime) <= 0 && (
                    <div className="text-sm text-destructive">
                      End time must be after start time
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-primary text-lg font-bold">
                      ${calculateTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                  submitting ||
                  !date ||
                  !startTime ||
                  !endTime ||
                  !selectedServiceId ||
                  calculateDuration(startTime, endTime) <= 0
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
