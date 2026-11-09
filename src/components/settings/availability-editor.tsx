'use client';

import { CalendarClock, Copy, Plus, X } from 'lucide-react';

import { useMyAvailability } from '@/hooks/useMyAvailability';
import {
  DEFAULT_SLOT,
  formatTime,
  nextSlot,
  WEEKDAYS,
  weekErrors,
  weeklyHours,
  type TimeSlot,
} from '@/lib/availability';
import { cn } from '@/lib/utils';
import {
  LoadingLayout,
  RequestError,
  Skeleton,
} from '@/components/astrology/ui/observatory-state';

const TIME_INPUT =
  'h-10 w-[7.5rem] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--solar-orange)]';

/**
 * A consultant's weekly hours, day by day. Shared by ParlezHub and Shakti
 * Wheel: it is drawn with the obs-* tokens, which each app themes, and edits
 * the one schedule the consultant account has.
 */
export function AvailabilityEditor() {
  const { draft, setDraft, isLoading, error, retry, isDirty, isSaving, save, discard } =
    useMyAvailability();

  if (error) {
    return (
      <RequestError
        title="Your availability could not be loaded"
        message="Nothing has changed. Check your connection and try again."
        onRetry={retry}
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingLayout label="Loading your availability…" className="obs-card gap-0 p-0">
        {WEEKDAYS.map((day) => (
          <div key={day} className="flex items-center gap-4 border-b border-[var(--border-subtle)] p-5 last:border-0">
            <Skeleton className="h-6 w-28" rounded="rounded-md" />
            <Skeleton className="h-10 w-64 max-w-full" rounded="rounded-xl" />
          </div>
        ))}
      </LoadingLayout>
    );
  }

  const errors = weekErrors(draft);
  const hasErrors = errors.some(Boolean);
  const hours = weeklyHours(draft);
  const openDays = draft.filter((slots) => slots.length > 0).length;

  const updateDay = (day: number, slots: TimeSlot[]) =>
    setDraft((week) => week.map((current, index) => (index === day ? slots : current)));

  const copyToAll = (day: number) =>
    setDraft((week) => week.map(() => draft[day].map((slot) => ({ ...slot }))));

  return (
    <div className="space-y-5">
      <div className="obs-card flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--solar-orange)_14%,transparent)] text-[var(--solar-orange)]">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">
            {openDays === 0
              ? 'You are not bookable yet'
              : `${hours} ${hours === 1 ? 'hour' : 'hours'} a week, across ${openDays} ${openDays === 1 ? 'day' : 'days'}`}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {openDays === 0
              ? 'Turn on the days you work and add your hours. Learners can only book you inside them.'
              : 'Learners can only book sessions inside these hours. This schedule is shared by all your consultant work.'}
          </p>
        </div>
      </div>

      <ul className="obs-card divide-y divide-[var(--border-subtle)] p-0" aria-label="Weekly availability">
        {WEEKDAYS.map((dayName, day) => (
          <DayRow
            key={dayName}
            name={dayName}
            slots={draft[day]}
            error={errors[day]}
            onChange={(slots) => updateDay(day, slots)}
            onCopyToAll={() => copyToAll(day)}
          />
        ))}
      </ul>

      {(isDirty || isSaving) && (
        <div className="obs-card sticky bottom-4 z-10 flex flex-wrap items-center gap-3 p-4 shadow-xl">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground" role="status">
            {hasErrors ? 'Fix the highlighted days to save.' : 'You have unsaved changes.'}
          </p>
          <button type="button" className="obs-control text-sm" onClick={discard} disabled={isSaving}>
            Discard
          </button>
          <button type="button" className="obs-button text-sm" onClick={save} disabled={isSaving || hasErrors}>
            {isSaving ? 'Saving…' : 'Save availability'}
          </button>
        </div>
      )}
    </div>
  );
}

function DayRow({
  name,
  slots,
  error,
  onChange,
  onCopyToAll,
}: {
  name: (typeof WEEKDAYS)[number];
  slots: TimeSlot[];
  error: string | null;
  onChange: (slots: TimeSlot[]) => void;
  onCopyToAll: () => void;
}) {
  const isOpen = slots.length > 0;
  const setSlot = (index: number, patch: Partial<TimeSlot>) =>
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));

  return (
    <li className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
      <div className="flex w-40 shrink-0 items-center gap-3 sm:pt-2">
        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          aria-label={`Available on ${name}`}
          onClick={() => onChange(isOpen ? [] : [{ ...DEFAULT_SLOT }])}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--solar-orange)]',
            isOpen
              ? 'border-transparent bg-[var(--solar-orange)]'
              : 'border-[var(--border-subtle)] bg-[var(--surface-2)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-[left] motion-reduce:transition-none',
              isOpen ? 'left-[1.4rem]' : 'left-1'
            )}
          />
        </button>
        <span className={cn('font-medium', isOpen ? 'text-foreground' : 'text-muted-foreground')}>
          {name}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {!isOpen ? (
          <p className="text-sm text-muted-foreground sm:pt-2">Unavailable</p>
        ) : (
          <>
            {slots.map((slot, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  step={900}
                  value={slot.start}
                  onChange={(event) => setSlot(index, { start: event.target.value })}
                  aria-label={`${name} range ${index + 1} start`}
                  className={cn(TIME_INPUT, error && 'border-[var(--danger)]')}
                />
                <span className="text-sm text-muted-foreground" aria-hidden="true">
                  to
                </span>
                <input
                  type="time"
                  step={900}
                  value={slot.end}
                  onChange={(event) => setSlot(index, { end: event.target.value })}
                  aria-label={`${name} range ${index + 1} end`}
                  className={cn(TIME_INPUT, error && 'border-[var(--danger)]')}
                />
                <button
                  type="button"
                  onClick={() => onChange(slots.filter((_, i) => i !== index))}
                  aria-label={`Remove ${name} ${formatTime(slot.start)} to ${formatTime(slot.end)}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {error && (
              <p role="alert" className="text-sm text-[var(--danger)]">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChange([...slots, nextSlot(slots)])}
                className="obs-control min-h-9 gap-1.5 px-3 py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add time
              </button>
              <button
                type="button"
                onClick={onCopyToAll}
                disabled={Boolean(error)}
                className="obs-control min-h-9 gap-1.5 px-3 py-1.5 text-xs"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy to all days
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
