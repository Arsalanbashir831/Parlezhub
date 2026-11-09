import { describe, expect, it } from 'vitest';

import {
  dayError,
  emptyWeek,
  fromApi,
  isWeekValid,
  nextSlot,
  sameWeek,
  toApi,
  weeklyHours,
  type WeekSchedule,
} from '@/lib/availability';

const item = (day: number, start: string, end: string) => ({
  day_of_week: day,
  start_time: start,
  end_time: end,
  is_recurring: true,
});

describe('fromApi / toApi', () => {
  it('reads several ranges a day, Monday first, in time order', () => {
    const week = fromApi([
      item(0, '14:00:00', '18:00:00'),
      item(0, '09:00:00', '12:00:00'),
      item(6, '10:00:00', '11:30:00'),
    ]);
    expect(week[0]).toEqual([
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '18:00' },
    ]);
    expect(week[6]).toEqual([{ start: '10:00', end: '11:30' }]);
    expect(week[1]).toEqual([]);
  });

  it('skips rows the backend could not have meant', () => {
    expect(fromApi([item(7, '09:00', '10:00'), item(-1, '09:00', '10:00')]).flat()).toEqual([]);
  });

  it('writes the backend format back, and survives a round trip', () => {
    const week = fromApi([item(2, '09:00:00', '12:00:00'), item(2, '13:00:00', '17:00:00')]);
    expect(toApi(week)).toEqual([item(2, '09:00:00', '12:00:00'), item(2, '13:00:00', '17:00:00')]);
  });

  it('saves an empty week as no rows', () => {
    expect(toApi(emptyWeek())).toEqual([]);
  });
});

describe('dayError', () => {
  it('accepts separate ranges', () => {
    expect(dayError([{ start: '09:00', end: '12:00' }, { start: '12:00', end: '15:00' }])).toBeNull();
  });

  it('rejects a range that ends before it starts', () => {
    expect(dayError([{ start: '18:00', end: '09:00' }])).toMatch(/end after it starts/);
  });

  it('rejects overlapping ranges, in any order', () => {
    expect(dayError([{ start: '13:00', end: '17:00' }, { start: '09:00', end: '14:00' }])).toMatch(/overlap/);
  });

  it('rejects a half-filled time', () => {
    expect(dayError([{ start: '', end: '10:00' }])).toMatch(/start and an end/);
  });

  it('a week is valid only when every day is', () => {
    const week: WeekSchedule = emptyWeek();
    week[3] = [{ start: '10:00', end: '09:00' }];
    expect(isWeekValid(week)).toBe(false);
    week[3] = [{ start: '09:00', end: '10:00' }];
    expect(isWeekValid(week)).toBe(true);
  });
});

describe('helpers', () => {
  it('totals bookable hours', () => {
    const week = emptyWeek();
    week[0] = [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '14:30' }];
    week[4] = [{ start: '10:00', end: '11:00' }];
    expect(weeklyHours(week)).toBe(5.5);
  });

  it('suggests the next range after the last one, within the day', () => {
    expect(nextSlot([])).toEqual({ start: '09:00', end: '17:00' });
    expect(nextSlot([{ start: '09:00', end: '12:00' }])).toEqual({ start: '13:00', end: '15:00' });
    expect(nextSlot([{ start: '20:00', end: '23:00' }])).toEqual({ start: '22:00', end: '23:59' });
  });

  it('compares weeks regardless of range order', () => {
    const a = emptyWeek();
    const b = emptyWeek();
    a[1] = [{ start: '09:00', end: '10:00' }, { start: '11:00', end: '12:00' }];
    b[1] = [{ start: '11:00', end: '12:00' }, { start: '09:00', end: '10:00' }];
    expect(sameWeek(a, b)).toBe(true);
    b[1] = [];
    expect(sameWeek(a, b)).toBe(false);
  });
});
