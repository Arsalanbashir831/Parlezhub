import type { ApiAvailabilityItem } from '@/services/availability';

/**
 * A consultant's weekly availability: the hours learners can book them, as one
 * or more time ranges per weekday. Belongs to the consultant account, so
 * ParlezHub and Shakti Wheel edit the same schedule.
 *
 * The backend counts weekdays from Monday = 0 and writes times as HH:mm:ss;
 * the editor works in HH:mm. Pure, so the rules are tested without a server.
 */

export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface TimeSlot {
  /** HH:mm */
  start: string;
  /** HH:mm */
  end: string;
}

/** Index 0 is Monday, as on the backend. */
export type WeekSchedule = TimeSlot[][];

/** What a newly added range starts as. */
export const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00' };

export const emptyWeek = (): WeekSchedule => WEEKDAYS.map(() => []);

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** "09:00:00" or "09:00" to "09:00". */
const toHHmm = (time: string) => time.slice(0, 5);

const sortSlots = (slots: TimeSlot[]) =>
  [...slots].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

export function fromApi(items: ApiAvailabilityItem[]): WeekSchedule {
  const week = emptyWeek();
  for (const item of items) {
    const day = Number(item.day_of_week);
    if (!Number.isInteger(day) || day < 0 || day > 6) continue;
    if (!item.start_time || !item.end_time) continue;
    week[day].push({ start: toHHmm(item.start_time), end: toHHmm(item.end_time) });
  }
  return week.map(sortSlots);
}

export function toApi(week: WeekSchedule): ApiAvailabilityItem[] {
  return week.flatMap((slots, day) =>
    sortSlots(slots).map((slot) => ({
      day_of_week: day,
      start_time: `${slot.start}:00`,
      end_time: `${slot.end}:00`,
      is_recurring: true,
    }))
  );
}

/**
 * What is wrong with one day's ranges, in words a consultant can act on; null
 * when nothing is. A range must end after it starts (no overnight ranges: split
 * them across two days) and ranges must not overlap.
 */
export function dayError(slots: TimeSlot[]): string | null {
  for (const slot of slots) {
    if (!/^\d{2}:\d{2}$/.test(slot.start) || !/^\d{2}:\d{2}$/.test(slot.end))
      return 'Enter a start and an end time.';
    if (toMinutes(slot.end) <= toMinutes(slot.start))
      return 'Each range must end after it starts.';
  }
  const sorted = sortSlots(slots);
  for (let i = 1; i < sorted.length; i++) {
    if (toMinutes(sorted[i].start) < toMinutes(sorted[i - 1].end))
      return 'These ranges overlap. Merge them or move one.';
  }
  return null;
}

export const weekErrors = (week: WeekSchedule) => week.map(dayError);

export const isWeekValid = (week: WeekSchedule) => weekErrors(week).every((e) => e === null);

/** Bookable hours in the week, for the summary line. */
export function weeklyHours(week: WeekSchedule): number {
  const minutes = week
    .flat()
    .reduce((sum, slot) => sum + Math.max(0, toMinutes(slot.end) - toMinutes(slot.start)), 0);
  return Math.round((minutes / 60) * 10) / 10;
}

/** A sensible next range after the day's last one: an hour later, two hours long. */
export function nextSlot(slots: TimeSlot[]): TimeSlot {
  const last = sortSlots(slots).at(-1);
  if (!last) return DEFAULT_SLOT;
  const start = Math.min(toMinutes(last.end) + 60, 22 * 60);
  return { start: fromMinutes(start), end: fromMinutes(Math.min(start + 120, 23 * 60 + 59)) };
}

/** Whether two schedules say the same thing, ignoring range order. */
export function sameWeek(a: WeekSchedule, b: WeekSchedule): boolean {
  return JSON.stringify(a.map(sortSlots)) === JSON.stringify(b.map(sortSlots));
}

/** "9:00 AM" style, for the summary of a day. */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}
