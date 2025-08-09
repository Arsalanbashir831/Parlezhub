'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export type AvailabilityDay = {
  day:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  isAvailable: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
};

export type AvailabilitySchedule = AvailabilityDay[];

const DAYS: AvailabilityDay['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const availabilitySchema = z.array(
  z.object({
    day: z.enum([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]),
    isAvailable: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
);

function isTimeBefore(a: string, b: string) {
  return a.localeCompare(b) < 0;
}

interface AvailabilityCalendarProps {
  value?: AvailabilitySchedule;
  onChange?: (schedule: AvailabilitySchedule) => void;
  onSave?: (schedule: AvailabilitySchedule) => Promise<void> | void;
  isSaving?: boolean;
  // Optional modal usage props
  asDialog?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  readOnly?: boolean; // default true
}

export default function AvailabilityCalendar({
  value,
  onChange,
  onSave,
  isSaving = false,
  asDialog = false,
  open,
  onOpenChange,
  title = 'Availability',
  description = 'Set your weekly availability for student bookings.',
  readOnly = true,
}: AvailabilityCalendarProps) {
  const initial: AvailabilitySchedule = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        isAvailable: false,
        startTime: '09:00',
        endTime: '17:00',
      })),
    []
  );

  const [schedule, setSchedule] = useState<AvailabilitySchedule>(
    value ?? initial
  );
  const [isEditing, setIsEditing] = useState<boolean>(!readOnly);

  // Keep internal schedule in sync when value changes
  useEffect(() => {
    if (value) setSchedule(value);
  }, [value]);

  const handleToggleDay = (index: number, checked: boolean) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isAvailable: checked };
      onChange?.(next);
      return next;
    });
  };

  const handleTimeChange = (
    index: number,
    key: 'startTime' | 'endTime',
    time: string
  ) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: time } as AvailabilityDay;
      onChange?.(next);
      return next;
    });
  };

  const validate = (): boolean => {
    const parse = availabilitySchema.safeParse(schedule);
    if (!parse.success) {
      toast.error('Invalid availability', {
        description: 'Please check your times and try again.',
      });
      return false;
    }
    for (const d of schedule) {
      if (d.isAvailable && !isTimeBefore(d.startTime, d.endTime)) {
        toast.error(`Invalid time range for ${d.day}`, {
          description: 'Start time must be before end time.',
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await onSave?.(schedule);
      toast.success('Availability saved');
      if (asDialog) onOpenChange?.(false);
    } catch {
      toast.error('Failed to save availability');
    }
  };

  const content = (
    <Card className="w-full">
      <CardHeader className="flex flex-col justify-between sm:flex-row md:items-center">
        <CardTitle>{title}</CardTitle>

        <div className="flex justify-end gap-2 self-end pt-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              Edit Schedule
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  // reset back to incoming value
                  if (value) setSchedule(value);
                  if (readOnly) setIsEditing(false);
                  if (asDialog) onOpenChange?.(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Availability'}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Separator />
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {schedule.map((d, idx) => (
            <div
              key={d.day}
              className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Checkbox
                  id={`avail-${d.day}`}
                  checked={d.isAvailable}
                  onCheckedChange={(c) => handleToggleDay(idx, Boolean(c))}
                  disabled={!isEditing}
                />
                <label
                  htmlFor={`avail-${d.day}`}
                  className="text-sm font-medium"
                >
                  {d.day}
                </label>
              </div>
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Input
                  type="time"
                  value={d.startTime}
                  onChange={(e) =>
                    handleTimeChange(idx, 'startTime', e.target.value)
                  }
                  disabled={!isEditing || !d.isAvailable}
                  className="w-full sm:w-28"
                />
                <span className="text-center text-xs text-muted-foreground">
                  to
                </span>
                <Input
                  type="time"
                  value={d.endTime}
                  onChange={(e) =>
                    handleTimeChange(idx, 'endTime', e.target.value)
                  }
                  disabled={!isEditing || !d.isAvailable}
                  className="w-full sm:w-28"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (!asDialog) return content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
