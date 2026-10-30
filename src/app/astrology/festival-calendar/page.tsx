'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Info,
  Loader2,
  MapPin,
  Moon,
  MoonStar,
  Sparkles,
  Wheat,
} from 'lucide-react';

import {
  useFestivalCalendar,
  type FestivalCalendarResponse,
} from '@/hooks/useAstrology';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const YEARS = Array.from({ length: 16 }, (_, i) => 2020 + i);
const FESTIVAL_TYPES = [
  { value: 'all', label: 'All festivals' },
  { value: 'major', label: 'Major festivals only' },
  { value: 'regional', label: 'Regional' },
  { value: 'religious', label: 'Religious' },
  { value: 'fasting', label: 'Fasting / Vrat' },
  { value: 'auspicious', label: 'Auspicious days' },
];
const REGIONS = [
  { value: 'all', label: 'All regions' },
  ...[
    'North India',
    'South India',
    'Maharashtra',
    'Karnataka',
    'Gujarat',
    'Tamil Nadu',
    'Bengal',
  ].map((value) => ({ value, label: value })),
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DailyEvents = Pick<
  FestivalCalendarResponse,
  'festivals' | 'ekadashis' | 'purnimas' | 'special_amavasyas'
>;
type EventType = 'festival' | 'ekadashi' | 'purnima' | 'amavasya';
type CalendarEvent = {
  type: EventType;
  date: string;
  title: string;
  subtitle?: string;
  significance?: string;
  rituals?: string[];
  raw:
    | FestivalCalendarResponse['festivals'][number]
    | FestivalCalendarResponse['ekadashis'][number]
    | FestivalCalendarResponse['purnimas'][number]
    | FestivalCalendarResponse['special_amavasyas'][number];
};

// Each observance kind keeps one colour everywhere: cells, dots, chips, cards.
const EVENT_TONE: Record<EventType, 'deep' | 'jade' | 'gold' | 'nebula'> = {
  festival: 'deep',
  ekadashi: 'jade',
  purnima: 'gold',
  amavasya: 'nebula',
};
const EVENT_LABEL: Record<EventType, string> = {
  festival: 'Festival',
  ekadashi: 'Ekadashi',
  purnima: 'Full moon',
  amavasya: 'New moon',
};
const EVENT_DOT: Record<EventType, string> = {
  festival: 'bg-ember-deep',
  ekadashi: 'bg-[var(--success)]',
  purnima: 'bg-[var(--solar-gold)]',
  amavasya: 'bg-nebula',
};
const EVENT_ICON: Record<EventType, typeof Sparkles> = {
  festival: Sparkles,
  ekadashi: Wheat,
  purnima: Moon,
  amavasya: MoonStar,
};

// Calendar padding and date matching retain the existing date-only rules.
function getDaysInMonth(year: number, month: number) {
  const days = [];
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--)
    days.push({
      day: prevMonthTotalDays - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  for (let i = 1; i <= totalDays; i++)
    days.push({ day: i, month, year, isCurrentMonth: true });
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++)
    days.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  return days;
}

const pad = (value: number) => String(value).padStart(2, '0');
const isoDate = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

function dayEvents(date: string, data?: FestivalCalendarResponse) {
  return data?.festivals?.filter((f) => f.date === date) ?? [];
}

export default function FestivalCalendarPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayIso = isoDate(currentYear, currentMonth, today.getDate());
  const [year, setYear] = useState(currentYear);
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [festivalType, setFestivalType] = useState('all');
  const [region, setRegion] = useState('all');
  const [selectedDay, setSelectedDay] = useState<{
    day: number;
    month: number;
    year: number;
  } | null>({ day: today.getDate(), month: currentMonth, year: currentYear });
  const payload = useMemo(
    () => ({
      year,
      festival_type: festivalType === 'all' ? null : festivalType,
      region: region === 'all' ? null : region,
    }),
    [year, festivalType, region]
  );
  const { data, isLoading, isError, refetch } = useFestivalCalendar(payload);

  const calendarDays = useMemo(
    () => getDaysInMonth(year, activeMonth),
    [year, activeMonth]
  );
  const dailyEventsMap = useMemo(() => {
    const map: Record<string, DailyEvents> = {};
    if (!data) return map;
    calendarDays.forEach((d) => {
      const date = isoDate(d.year, d.month, d.day);
      const festivals = dayEvents(date, data);
      const ekadashis =
        data.ekadashis?.filter((e) => e.date === date) || [];
      const purnimas = data.purnimas?.filter((p) => p.date === date) || [];
      const special_amavasyas =
        data.special_amavasyas?.filter((a) => a.date === date) || [];
      if (
        festivals.length ||
        ekadashis.length ||
        purnimas.length ||
        special_amavasyas.length
      )
        map[`${d.year}-${d.month}-${d.day}`] = {
          festivals,
          ekadashis,
          purnimas,
          special_amavasyas,
        };
    });
    return map;
  }, [data, calendarDays]);

  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [];
    if (!data) return list;
    data.festivals?.forEach((f) =>
      list.push({
        type: 'festival',
        date: f.date,
        title: f.name,
        subtitle: f.name_hindi,
        significance: f.significance,
        rituals: f.rituals,
        raw: f,
      })
    );
    data.ekadashis?.forEach((e) =>
      list.push({
        type: 'ekadashi',
        date: e.date,
        title: e.name,
        subtitle: `${e.lunar_month} Month, ${e.paksha} Paksha`,
        raw: e,
      })
    );
    data.purnimas?.forEach((p) =>
      list.push({
        type: 'purnima',
        date: p.date,
        title: p.name,
        subtitle: `${p.lunar_month} Month`,
        significance: p.significance,
        raw: p,
      })
    );
    data.special_amavasyas?.forEach((a) =>
      list.push({
        type: 'amavasya',
        date: a.date,
        title: a.name,
        subtitle: `${a.lunar_month} Month`,
        significance: a.significance,
        raw: a,
      })
    );
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const monthEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        const [y, m] = event.date.split('-').map(Number);
        return y === year && m - 1 === activeMonth;
      }),
    [allEvents, year, activeMonth]
  );
  const nextEvent = useMemo(
    () => allEvents.find((event) => event.date >= todayIso),
    [allEvents, todayIso]
  );

  const selectedDateEvents = useMemo(() => {
    if (!selectedDay) return null;
    return (
      dailyEventsMap[
        `${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`
      ] || { festivals: [], ekadashis: [], purnimas: [], special_amavasyas: [] }
    );
  }, [selectedDay, dailyEventsMap]);

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setYear((y) => Math.max(1900, y - 1));
    } else setActiveMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setYear((y) => Math.min(2100, y + 1));
    } else setActiveMonth((m) => m + 1);
  };
  const goToDay = (day: number, month: number, targetYear: number) => {
    setSelectedDay({ day, month, year: targetYear });
    setActiveMonth(month);
    setYear(targetYear);
  };

  const formattedSelectedDateLabel = selectedDay
    ? `${MONTHS[selectedDay.month]} ${selectedDay.day}, ${selectedDay.year}`
    : 'Select a date';
  const selectedCount = selectedDateEvents
    ? selectedDateEvents.festivals.length +
      selectedDateEvents.ekadashis.length +
      selectedDateEvents.purnimas.length +
      selectedDateEvents.special_amavasyas.length
    : 0;
  const daysUntilNext = nextEvent
    ? Math.round(
        (new Date(`${nextEvent.date}T00:00:00`).getTime() -
          new Date(`${todayIso}T00:00:00`).getTime()) /
          86400000
      )
    : null;

  return (
    <div className="flex min-w-0 flex-col gap-6 text-foreground">
      <header className="relative space-y-2 overflow-hidden">
        <div className="obs-orbit" aria-hidden="true" />
        <p className="obs-label flex items-center gap-2">
          <CalendarDays className="h-4 w-4" /> Festivals & lunar dates
        </p>
        <h1 className="obs-title">Festival Calendar</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Festivals and lunar observances for the selected year. Each kind keeps
          its own colour, so the month grid, the day list and the detail cards
          read at a glance.
        </p>
      </header>

      {nextEvent && !isError && (
        <section
          data-tone={EVENT_TONE[nextEvent.type]}
          className="obs-glass flex min-w-0 flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
          aria-label="Next observance"
        >
          <div className="flex min-w-0 items-center gap-4">
            <span
              data-tone={EVENT_TONE[nextEvent.type]}
              className="obs-tile flex h-14 w-14 shrink-0 flex-col items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-lg font-bold leading-none">
                {Number(nextEvent.date.slice(-2))}
              </span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">
                {MONTHS[Number(nextEvent.date.slice(5, 7)) - 1].slice(0, 3)}
              </span>
            </span>
            <div className="min-w-0 space-y-1">
              <p className="obs-label">Next observance</p>
              <h2 className="truncate text-xl font-semibold">
                {nextEvent.title}
              </h2>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="obs-chip" data-tone={EVENT_TONE[nextEvent.type]}>
                  {EVENT_LABEL[nextEvent.type]}
                </span>
                {nextEvent.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {daysUntilNext !== null && (
              <span className="obs-chip" data-tone="gold">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {daysUntilNext === 0
                  ? 'Today'
                  : daysUntilNext === 1
                    ? 'Tomorrow'
                    : `in ${daysUntilNext} days`}
              </span>
            )}
            <button
              type="button"
              className="obs-control obs-accent gap-2"
              onClick={() => {
                const [y, m, d] = nextEvent.date.split('-').map(Number);
                goToDay(d, m - 1, y);
              }}
            >
              Show this day
            </button>
          </div>
        </section>
      )}

      <section
        className="obs-card grid min-w-0 gap-4 p-4 sm:grid-cols-3 sm:p-5"
        aria-label="Calendar filters"
      >
        <div className="space-y-2">
          <label id="calendar-year-label" className="obs-label">
            Year
          </label>
          <Select
            value={String(year)}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger
              aria-labelledby="calendar-year-label"
              className="obs-control h-11 text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="observatory-theme border-border bg-card text-foreground">
              {Array.from(new Set([...YEARS, year]))
                .sort((a, b) => a - b)
                .map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label
            id="calendar-type-label"
            className="obs-label flex items-center gap-1"
          >
            <Filter className="h-3 w-3" /> Type
          </label>
          <Select value={festivalType} onValueChange={setFestivalType}>
            <SelectTrigger
              aria-labelledby="calendar-type-label"
              className="obs-control h-11 text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="observatory-theme border-border bg-card text-foreground">
              {FESTIVAL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label
            id="calendar-region-label"
            className="obs-label flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" /> Region
          </label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger
              aria-labelledby="calendar-region-label"
              className="obs-control h-11 text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="observatory-theme border-border bg-card text-foreground">
              {REGIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-3">
          {(Object.keys(EVENT_LABEL) as EventType[]).map((type) => (
            <span key={type} className="obs-chip" data-tone={EVENT_TONE[type]}>
              {EVENT_LABEL[type]}
            </span>
          ))}
          <p className="text-xs leading-relaxed text-muted-foreground">
            Region:{' '}
            {data?.filters_applied?.region ||
              REGIONS.find((item) => item.value === region)?.label}
            . Dates are as supplied by the calendar service; it does not provide
            a location timezone.
          </p>
        </div>
      </section>

      {isError && (
        <div role="alert" className="obs-card space-y-3 p-5">
          <h2 className="font-semibold">Calendar could not be loaded</h2>
          <p className="text-sm text-muted-foreground">
            Try again or adjust the filters. No empty calendar should be
            interpreted as a confirmed absence of festivals.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="obs-control obs-accent"
          >
            Try again
          </button>
        </div>
      )}
      {isLoading && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />{' '}
          Loading calendar dates…
        </p>
      )}

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,2.4fr)_minmax(280px,1fr)]">
        <section
          className="obs-card min-w-0 overflow-hidden"
          aria-busy={isLoading}
          aria-label={`${MONTHS[activeMonth]} ${year} calendar`}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
            <div>
              <h2 className="text-xl font-semibold">
                {MONTHS[activeMonth]}{' '}
                <span className="text-muted-foreground">{year}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {monthEvents.length} observance
                {monthEvents.length === 1 ? '' : 's'} this month · select a day
                for its details
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToDay(today.getDate(), currentMonth, currentYear)}
                className="obs-control h-11 gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                Today
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="obs-control h-11 w-11 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="obs-control h-11 w-11 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </header>
          <div className="p-2 sm:p-4">
            <div className="mb-2 grid grid-cols-7 text-center">
              {WEEKDAYS.map((d) => (
                <div key={d} className="obs-label py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((d) => {
                const key = `${d.year}-${d.month}-${d.day}`;
                const events =
                  !isError && !isLoading ? dailyEventsMap[key] : undefined;
                const list: CalendarEvent[] = events
                  ? [
                      ...events.festivals.map((f) => ({
                        type: 'festival' as const,
                        date: isoDate(d.year, d.month, d.day),
                        title: f.name,
                        raw: f,
                      })),
                      ...events.ekadashis.map((e) => ({
                        type: 'ekadashi' as const,
                        date: isoDate(d.year, d.month, d.day),
                        title: e.name,
                        raw: e,
                      })),
                      ...events.purnimas.map((p) => ({
                        type: 'purnima' as const,
                        date: isoDate(d.year, d.month, d.day),
                        title: p.name,
                        raw: p,
                      })),
                      ...events.special_amavasyas.map((a) => ({
                        type: 'amavasya' as const,
                        date: isoDate(d.year, d.month, d.day),
                        title: a.name,
                        raw: a,
                      })),
                    ]
                  : [];
                const count = list.length;
                const isSelected =
                  selectedDay?.day === d.day &&
                  selectedDay.month === d.month &&
                  selectedDay.year === d.year;
                const isToday = isoDate(d.year, d.month, d.day) === todayIso;
                const names = list.map((event) => event.title).join(', ');
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => goToDay(d.day, d.month, d.year)}
                    aria-pressed={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={`${MONTHS[d.month]} ${d.day}, ${d.year}${isToday ? ', today' : ''}${count ? `, ${count} observances: ${names}` : ''}`}
                    data-tone={count ? EVENT_TONE[list[0].type] : 'none'}
                    className={cn(
                      'obs-cal-cell flex min-h-[54px] min-w-0 flex-col gap-1 p-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 sm:min-h-[92px] sm:p-2',
                      isSelected && 'ring-2 ring-primary-400',
                      !d.isCurrentMonth &&
                        'opacity-45 saturate-50'
                    )}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums',
                          isToday
                            ? 'text-[var(--solar-gold)]'
                            : 'text-foreground',
                          !d.isCurrentMonth && 'text-muted-foreground'
                        )}
                      >
                        {d.day}
                      </span>
                      {isToday && (
                        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--solar-gold)] sm:inline">
                          Today
                        </span>
                      )}
                    </span>
                    {count > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {list.slice(0, 3).map((event, index) => (
                          <span
                            key={`${event.title}-${index}`}
                            aria-hidden="true"
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              EVENT_DOT[event.type]
                            )}
                          />
                        ))}
                        {count > 3 && (
                          <span className="text-[10px] leading-none text-muted-foreground">
                            +{count - 3}
                          </span>
                        )}
                      </span>
                    )}
                    {d.isCurrentMonth && list[0] && (
                      <span className="hidden min-w-0 flex-col gap-0.5 text-xs sm:flex">
                        <span className="truncate text-muted-foreground">
                          {list[0].title}
                        </span>
                        {count > 1 && (
                          <span className="text-muted-foreground">
                            +{count - 1} more
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="obs-card flex min-w-0 flex-col gap-3 p-4 sm:p-5"
          aria-label={`Observances in ${MONTHS[activeMonth]}`}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="obs-label">
              {MONTHS[activeMonth]} observances
            </h2>
            <span className="obs-chip">{monthEvents.length}</span>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading observances…</p>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">
              The day list is unavailable until the calendar loads.
            </p>
          ) : monthEvents.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No observances were returned for this month and these filters. Try
              another month or region.
            </p>
          ) : (
            <ol className="-mx-1 max-h-[520px] min-w-0 space-y-1 overflow-y-auto px-1">
              {monthEvents.map((event, index) => {
                const [y, m, dayNumber] = event.date.split('-').map(Number);
                const isNext = event.date === nextEvent?.date;
                const isPast = event.date < todayIso;
                const weekday = new Date(
                  y,
                  m - 1,
                  dayNumber
                ).toLocaleDateString('en-US', { weekday: 'short' });
                const Icon = EVENT_ICON[event.type];
                return (
                  <li key={`${event.title}-${index}`}>
                    <button
                      type="button"
                      onClick={() => goToDay(dayNumber, m - 1, y)}
                      className={cn(
                        'obs-tile flex min-h-11 w-full min-w-0 items-start gap-3 p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400',
                        isPast && 'opacity-60 saturate-50'
                      )}
                      data-tone={EVENT_TONE[event.type]}
                    >
                      <span className="w-9 shrink-0 text-center">
                        <span className="block text-base font-semibold tabular-nums leading-tight">
                          {dayNumber}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {weekday}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="break-words text-sm font-semibold">
                            {event.title}
                          </span>
                          {isNext && (
                            <span className="obs-chip" data-tone="gold">
                              Next
                            </span>
                          )}
                        </span>
                        <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon className="h-3 w-3" aria-hidden="true" />
                            {EVENT_LABEL[event.type]}
                          </span>
                          {event.subtitle && (
                            <span className="truncate">{event.subtitle}</span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">
            Dates already past are dimmed. Selecting an entry jumps the calendar
            to that day.
          </p>
        </section>
      </div>

      {data?.calculation_notes?.note && !isError && (
        <section className="obs-card flex items-start gap-3 p-5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">
              Panchang calculation notes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {data.calculation_notes.note}
            </p>
          </div>
        </section>
      )}

      <section
        className="obs-card min-w-0 space-y-4 p-5"
        aria-label="Selected date details"
      >
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <p className="obs-label">Selected date</p>
            <h2 className="text-xl font-semibold">
              {formattedSelectedDateLabel}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedCount > 0 ? (
              (Object.keys(EVENT_LABEL) as EventType[]).map((type) => {
                const countForType = selectedDateEvents
                  ? type === 'festival'
                    ? selectedDateEvents.festivals.length
                    : type === 'ekadashi'
                      ? selectedDateEvents.ekadashis.length
                      : type === 'purnima'
                        ? selectedDateEvents.purnimas.length
                        : selectedDateEvents.special_amavasyas.length
                  : 0;
                return countForType ? (
                  <span
                    key={type}
                    className="obs-chip"
                    data-tone={EVENT_TONE[type]}
                  >
                    {countForType} {EVENT_LABEL[type]}
                  </span>
                ) : null;
              })
            ) : (
              <span className="obs-chip" data-tone="nebula">
                No observances
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading date details…</p>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            Date details are currently unavailable.
          </p>
        ) : !selectedDay || !selectedCount ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No festivals or lunar observances were returned for this date and
            the current filters.
          </p>
        ) : (
          <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {selectedDateEvents?.festivals.map((f) => {
              const Icon = EVENT_ICON.festival;
              return (
                <article
                  key={f.key}
                  data-tone={EVENT_TONE.festival}
                  className="obs-tile min-w-0 space-y-3 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-primary-400">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-base font-semibold">{f.name}</h3>
                      {f.name_hindi && (
                        <p className="text-sm text-muted-foreground">
                          {f.name_hindi}
                        </p>
                      )}
                      {f.type && (
                        <span className="obs-chip" data-tone="deep">
                          {f.type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  {f.significance && (
                    <div className="space-y-1">
                      <h4 className="obs-label">Significance</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {f.significance}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {f.timing_type && (
                      <p>
                        <span className="font-medium text-foreground">
                          Date rule:{' '}
                        </span>
                        {f.timing_type.replace(/_/g, ' ')}
                      </p>
                    )}
                    {f.duration_days && (
                      <p>
                        Duration: {f.duration_days} day
                        {f.duration_days === 1 ? '' : 's'}
                        {f.end_date ? ` · Ends ${f.end_date}` : ''}
                      </p>
                    )}
                  </div>
                  {f.regions?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {f.regions.map((item) => (
                        <span key={item} className="obs-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {f.rituals?.length ? (
                    <div className="space-y-1 border-t border-border pt-3">
                      <h4 className="obs-label">Traditional rituals</h4>
                      <ul className="space-y-1 text-sm leading-relaxed text-muted-foreground marker:text-primary-400">
                        {f.rituals.map((ritual) => (
                          <li key={ritual} className="list-disc pl-4">
                            {ritual}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              );
            })}
            {selectedDateEvents?.ekadashis.map((e) => {
              const Icon = EVENT_ICON.ekadashi;
              return (
                <article
                  key={e.name}
                  data-tone={EVENT_TONE.ekadashi}
                  className="obs-tile min-w-0 space-y-2 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--success)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-semibold">{e.name}</h3>
                  </div>
                  <span className="obs-chip" data-tone="jade">
                    Ekadashi · lunar 11th day
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {e.lunar_month} month · {e.paksha} Paksha
                  </p>
                </article>
              );
            })}
            {selectedDateEvents?.purnimas.map((p) => {
              const Icon = EVENT_ICON.purnima;
              return (
                <article
                  key={p.name}
                  data-tone={EVENT_TONE.purnima}
                  className="obs-tile min-w-0 space-y-2 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--solar-gold)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-semibold">{p.name}</h3>
                  </div>
                  <span className="obs-chip" data-tone="gold">
                    Full moon · {p.lunar_month} month
                  </span>
                  {p.significance && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {p.significance}
                    </p>
                  )}
                </article>
              );
            })}
            {selectedDateEvents?.special_amavasyas.map((a) => {
              const Icon = EVENT_ICON.amavasya;
              return (
                <article
                  key={a.name}
                  data-tone={EVENT_TONE.amavasya}
                  className="obs-tile min-w-0 space-y-2 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-nebula">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-semibold">{a.name}</h3>
                  </div>
                  <span className="obs-chip" data-tone="nebula">
                    New moon · {a.lunar_month} month
                  </span>
                  {a.significance && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {a.significance}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
