'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { useFestivalCalendar } from '@/hooks/useAstrology';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Helper lists for selections
const YEARS = Array.from({ length: 16 }, (_, i) => 2020 + i); // 2020 to 2035

const FESTIVAL_TYPES = [
  { value: 'all', label: 'All Festivals' },
  { value: 'major', label: 'Major Festivals Only' },
  { value: 'regional', label: 'Regional' },
  { value: 'religious', label: 'Religious' },
  { value: 'fasting', label: 'Fasting / Vrat' },
  { value: 'auspicious', label: 'Auspicious Days' },
];

const REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'North India', label: 'North India' },
  { value: 'South India', label: 'South India' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Bengal', label: 'Bengal' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Calendar grid helper
function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  const firstDayIndex = date.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevMonthTotalDays - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill standard 6-row calendar (42 cells)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  return days;
}

export default function FestivalCalendarPage() {
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // State
  const [year, setYear] = useState<number>(currentYear);
  const [activeMonth, setActiveMonth] = useState<number>(currentMonth);
  const [festivalType, setFestivalType] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');

  // Selected day for detailed preview
  const [selectedDay, setSelectedDay] = useState<{ day: number; month: number; year: number } | null>({
    day: new Date().getDate(),
    month: currentMonth,
    year: currentYear,
  });

  // API query payload mapping
  const payload = useMemo(() => ({
    year,
    festival_type: festivalType === 'all' ? null : festivalType,
    region: region === 'all' ? null : region,
  }), [year, festivalType, region]);

  const { data, isLoading, isError } = useFestivalCalendar(payload);

  // Parse calendar date matching
  const matchDate = (eventDate: string, targetYear: number, targetMonth: number, targetDay: number) => {
    if (!eventDate) return false;
    const [y, m, d] = eventDate.split('-').map(Number);
    return y === targetYear && (m - 1) === targetMonth && d === targetDay;
  };

  // Get active month's days
  const calendarDays = useMemo(() => getDaysInMonth(year, activeMonth), [year, activeMonth]);

  // Map API response events to daily items
  const dailyEventsMap = useMemo(() => {
    if (!data) return {};

    const map: Record<string, {
      festivals: typeof data.festivals;
      ekadashis: typeof data.ekadashis;
      purnimas: typeof data.purnimas;
      special_amavasyas: typeof data.special_amavasyas;
    }> = {};

    calendarDays.forEach((d) => {
      const key = `${d.year}-${d.month}-${d.day}`;

      const dayFestivals = data.festivals?.filter((f) => matchDate(f.date, d.year, d.month, d.day)) || [];
      const dayEkadashis = data.ekadashis?.filter((e) => matchDate(e.date, d.year, d.month, d.day)) || [];
      const dayPurnimas = data.purnimas?.filter((p) => matchDate(p.date, d.year, d.month, d.day)) || [];
      const dayAmavasyas = data.special_amavasyas?.filter((a) => matchDate(a.date, d.year, d.month, d.day)) || [];

      if (dayFestivals.length > 0 || dayEkadashis.length > 0 || dayPurnimas.length > 0 || dayAmavasyas.length > 0) {
        map[key] = {
          festivals: dayFestivals,
          ekadashis: dayEkadashis,
          purnimas: dayPurnimas,
          special_amavasyas: dayAmavasyas,
        };
      }
    });

    return map;
  }, [data, calendarDays]);

  // Selected date events list
  const selectedDateEvents = useMemo(() => {
    if (!selectedDay) return null;
    const key = `${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`;
    return dailyEventsMap[key] || { festivals: [], ekadashis: [], purnimas: [], special_amavasyas: [] };
  }, [selectedDay, dailyEventsMap]);

  // All events in the active month
  const activeMonthEvents = useMemo(() => {
    const list: {
      type: 'festival' | 'ekadashi' | 'purnima' | 'amavasya';
      date: string;
      title: string;
      subtitle?: string;
      significance?: string;
      rituals?: string[];
      raw: any;
    }[] = [];

    if (!data) return list;

    // Filter festivals
    data.festivals?.forEach((f) => {
      const [y, m] = f.date.split('-').map(Number);
      if (y === year && (m - 1) === activeMonth) {
        list.push({
          type: 'festival',
          date: f.date,
          title: f.name,
          subtitle: f.name_hindi,
          significance: f.significance,
          rituals: f.rituals,
          raw: f,
        });
      }
    });

    // Filter ekadashis
    data.ekadashis?.forEach((e) => {
      const [y, m] = e.date.split('-').map(Number);
      if (y === year && (m - 1) === activeMonth) {
        list.push({
          type: 'ekadashi',
          date: e.date,
          title: e.name,
          subtitle: `${e.lunar_month} Month, ${e.paksha} Paksha`,
          raw: e,
        });
      }
    });

    // Filter purnimas
    data.purnimas?.forEach((p) => {
      const [y, m] = p.date.split('-').map(Number);
      if (y === year && (m - 1) === activeMonth) {
        list.push({
          type: 'purnima',
          date: p.date,
          title: p.name,
          subtitle: `${p.lunar_month} Month`,
          significance: p.significance,
          raw: p,
        });
      }
    });

    // Filter amavasyas
    data.special_amavasyas?.forEach((a) => {
      const [y, m] = a.date.split('-').map(Number);
      if (y === year && (m - 1) === activeMonth) {
        list.push({
          type: 'amavasya',
          date: a.date,
          title: a.name,
          subtitle: `${a.lunar_month} Month`,
          significance: a.significance,
          raw: a,
        });
      }
    });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [data, year, activeMonth]);

  // Navigate months
  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setYear((y) => Math.max(1900, y - 1));
    } else {
      setActiveMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setYear((y) => Math.min(2100, y + 1));
    } else {
      setActiveMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dayObj: typeof calendarDays[0]) => {
    setSelectedDay({
      day: dayObj.day,
      month: dayObj.month,
      year: dayObj.year,
    });
    // Sync current month view to day clicked if it is a padding day
    if (dayObj.month !== activeMonth) {
      setActiveMonth(dayObj.month);
      setYear(dayObj.year);
    }
  };

  const formattedSelectedDateLabel = selectedDay
    ? `${MONTHS[selectedDay.month]} ${selectedDay.day}, ${selectedDay.year}`
    : '';

  return (
    <div className="flex min-w-0 flex-col gap-6 p-4 duration-1000 animate-in fade-in zoom-in-95 md:gap-8 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-primary-500/10 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-primary-500 md:text-4xl">
            <CalendarIcon className="h-8 w-8 text-primary-500 md:h-10 md:w-10" />
            Vedic Festival Calendar
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
            Hindu calendar & celestial alignments
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-primary-500/10 bg-white/5 shadow-xl">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 min-w-[120px] flex-col gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-500/80">
                <CalendarIcon className="h-3 w-3" /> Year
              </span>
              <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
                <SelectTrigger className="border-primary-500/25 bg-background text-sm font-semibold">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="border-primary-500/20 bg-background text-primary-200">
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)} className="focus:bg-primary-500/10">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-[2] min-w-[160px] flex-col gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-500/80">
                <Filter className="h-3 w-3" /> Type
              </span>
              <Select value={festivalType} onValueChange={setFestivalType}>
                <SelectTrigger className="border-primary-500/25 bg-background text-sm font-semibold">
                  <SelectValue placeholder="Festival Type" />
                </SelectTrigger>
                <SelectContent className="border-primary-500/20 bg-background text-primary-200">
                  {FESTIVAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="focus:bg-primary-500/10">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-[2] min-w-[160px] flex-col gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-500/80">
                <MapPin className="h-3 w-3" /> Region
              </span>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="border-primary-500/25 bg-background text-sm font-semibold">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent className="border-primary-500/20 bg-background text-primary-200">
                  {REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="focus:bg-primary-500/10">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Calendar Grid */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <Card className="relative overflow-hidden border-primary-500/15 bg-white/5 shadow-2xl">
            {isLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-xs">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <span className="text-xs font-semibold text-primary-300">Calculating tithis and nakshatras...</span>
                </div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between border-b border-primary-500/10 py-4">
              <div>
                <CardTitle className="font-serif text-xl font-extrabold text-primary-200">
                  {MONTHS[activeMonth]} {year}
                </CardTitle>
                <CardDescription className="text-xs text-primary-100/60">
                  Select a day to view celestial alignments
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrevMonth} variant="outline" size="icon" className="h-8 w-8 border-primary-500/20 bg-background/30 hover:bg-primary-500/10">
                  <ChevronLeft className="h-4 w-4 text-primary-400" />
                </Button>
                <Button onClick={handleNextMonth} variant="outline" size="icon" className="h-8 w-8 border-primary-500/20 bg-background/30 hover:bg-primary-500/10">
                  <ChevronRight className="h-4 w-4 text-primary-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-serif text-xs font-black uppercase tracking-wider text-primary-500/80 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-2">{d}</div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                {calendarDays.map((d, index) => {
                  const key = `${d.year}-${d.month}-${d.day}`;
                  const dayEvents = dailyEventsMap[key];
                  const hasEvents = !!dayEvents;

                  const isSelected = selectedDay && selectedDay.day === d.day && selectedDay.month === d.month && selectedDay.year === d.year;
                  const isToday = new Date().getDate() === d.day && new Date().getMonth() === d.month && new Date().getFullYear() === d.year;

                  return (
                    <button
                      key={`${key}-${index}`}
                      onClick={() => handleDayClick(d)}
                      className={`group relative flex min-h-[70px] flex-col justify-between rounded-xl border p-2 text-left transition-all duration-200 outline-none ${d.isCurrentMonth
                        ? 'border-primary-500/10 bg-white/[0.01] hover:bg-primary-500/5'
                        : 'border-transparent bg-transparent text-primary-100/20'
                        } ${isSelected
                          ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-500/5 shadow-inner'
                          : ''
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isToday
                          ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-primary-950 font-bold'
                          : isSelected ? 'text-primary-400' : d.isCurrentMonth ? 'text-primary-100' : ''
                          }`}>
                          {d.day}
                        </span>

                        {/* Moon Icon for Purnima/Amavasya indicator */}
                        {dayEvents?.purnimas.length > 0 && (
                          <span className="text-[10px]" title="Purnima (Full Moon)">🌕</span>
                        )}
                        {dayEvents?.special_amavasyas.length > 0 && (
                          <span className="text-[10px]" title="Amavasya (New Moon)">🌑</span>
                        )}
                      </div>

                      {/* Event Mini Indicators */}
                      {hasEvents && d.isCurrentMonth && (
                        <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                          {dayEvents.festivals.slice(0, 1).map((f) => (
                            <div
                              key={f.key}
                              className={`truncate text-[8px] font-black uppercase px-1 py-0.5 rounded-md leading-tight text-center ${f.type === 'major'
                                ? 'bg-amber-500/20 border border-amber-500/35 text-amber-300'
                                : 'bg-primary-500/10 border border-primary-500/15 text-primary-300'
                                }`}
                            >
                              {f.name}
                            </div>
                          ))}
                          {dayEvents.ekadashis.slice(0, 1).map((e) => (
                            <div
                              key={e.name}
                              className="truncate text-[8px] font-black uppercase px-1 py-0.5 rounded-md leading-tight text-center bg-emerald-500/25 border border-emerald-500/35 text-emerald-300"
                            >
                              {e.name.replace(' Ekadashi', '')} Ekad.
                            </div>
                          ))}
                          {/* More dots if multiple events */}
                          {(dayEvents.festivals.length + dayEvents.ekadashis.length) > 1 && (
                            <div className="flex justify-center gap-0.5 mt-0.5">
                              <span className="h-1 w-1 rounded-full bg-primary-500"></span>
                              <span className="h-1 w-1 rounded-full bg-primary-500"></span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Info Note */}
          {data?.calculation_notes?.note && (
            <div className="flex items-start gap-3 rounded-2xl border border-primary-500/10 bg-primary-500/5 p-4 text-xs text-primary-300/80">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
              <div>
                <span className="font-extrabold uppercase tracking-wide text-primary-500 text-[10px]">Panchang Notes</span>
                <p className="mt-1 leading-relaxed">{data.calculation_notes.note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Details / Events lists */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Day Detail panel */}
          <Card className="border-primary-500/15 bg-white/5 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-primary-500/10 bg-primary-950/20 py-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary-500/80 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Selection Preview
              </span>
              <CardTitle className="font-serif text-lg font-bold text-primary-200">
                {formattedSelectedDateLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {!selectedDay ||
                (selectedDateEvents?.festivals.length === 0 &&
                  selectedDateEvents?.ekadashis.length === 0 &&
                  selectedDateEvents?.purnimas.length === 0 &&
                  selectedDateEvents?.special_amavasyas.length === 0) ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center text-center p-4">
                  <CalendarDays className="h-8 w-8 text-primary-500/25 mb-3" />
                  <p className="text-xs italic text-primary-100/40">
                    No major festivals or lunar alignments registered on this date.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-2">
                  <div className="space-y-5">
                    {/* Festivals */}
                    {selectedDateEvents?.festivals.map((f) => (
                      <div key={f.key} className="space-y-2.5 rounded-xl border border-primary-500/10 bg-white/[0.01] p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-extrabold text-primary-300">{f.name}</h4>
                            {f.name_hindi && <p className="text-xs text-primary-500/70 font-semibold mt-0.5">{f.name_hindi}</p>}
                          </div>
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${f.type === 'major' ? 'border-amber-500/40 bg-amber-500/5 text-amber-400' : 'border-primary-500/30 text-primary-400'
                            }`}>
                            {f.type}
                          </Badge>
                        </div>
                        {f.significance && (
                          <div className="text-xs text-primary-100/70">
                            <span className="font-bold text-primary-500/90 text-[10px] uppercase block tracking-wide">Significance</span>
                            <p className="mt-0.5 leading-relaxed">{f.significance}</p>
                          </div>
                        )}
                        {f.rituals && f.rituals.length > 0 && (
                          <div className="text-xs text-primary-100/70">
                            <span className="font-bold text-primary-500/90 text-[10px] uppercase block tracking-wide">Rituals</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {f.rituals.map((r) => (
                                <Badge key={r} variant="outline" className="border-primary-500/10 bg-white/5 text-[9px] text-primary-200">
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Ekadashis */}
                    {selectedDateEvents?.ekadashis.map((e) => (
                      <div key={e.name} className="space-y-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-emerald-400">{e.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-emerald-500/80">Lunar 11th Day</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-primary-100/70">
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300 uppercase tracking-wide">
                            {e.lunar_month} Month
                          </span>
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300 uppercase tracking-wide">
                            {e.paksha} Paksha
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Purnimas */}
                    {selectedDateEvents?.purnimas.map((p) => (
                      <div key={p.name} className="space-y-2 rounded-xl border border-sky-500/15 bg-sky-500/5 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-sky-400">🌕 {p.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-sky-500/80">Full Moon</span>
                        </div>
                        <p className="text-xs text-primary-100/60 font-semibold">{p.lunar_month} Month</p>
                        {p.significance && (
                          <p className="text-xs leading-relaxed text-primary-100/70 border-t border-sky-500/10 pt-2">{p.significance}</p>
                        )}
                      </div>
                    ))}

                    {/* Amavasyas */}
                    {selectedDateEvents?.special_amavasyas.map((a) => (
                      <div key={a.name} className="space-y-2 rounded-xl border border-purple-500/15 bg-purple-500/5 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-purple-400">🌑 {a.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-purple-500/80">New Moon</span>
                        </div>
                        <p className="text-xs text-primary-100/60 font-semibold">{a.lunar_month} Month</p>
                        {a.significance && (
                          <p className="text-xs leading-relaxed text-primary-100/70 border-t border-purple-500/10 pt-2">{a.significance}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Month Summary Event List */}
          <Card className="border-primary-500/15 bg-white/5 shadow-2xl flex-1">
            <CardHeader className="py-4 border-b border-primary-500/10">
              <CardTitle className="font-serif text-sm font-bold text-primary-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Month Event Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {activeMonthEvents.length === 0 ? (
                <div className="text-center py-6 text-xs italic text-primary-100/30">
                  No events found in this month.
                </div>
              ) : (
                <ScrollArea className="h-[250px] pr-2">
                  <div className="space-y-3">
                    {activeMonthEvents.map((evt, index) => {
                      const dayNumber = Number(evt.date.split('-')[2]);
                      const weekday = new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short' });

                      let typeBadgeClasses = 'border-primary-500/20 text-primary-400 bg-white/5';
                      if (evt.type === 'ekadashi') typeBadgeClasses = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5';
                      if (evt.type === 'purnima') typeBadgeClasses = 'border-sky-500/30 text-sky-400 bg-sky-500/5';
                      if (evt.type === 'amavasya') typeBadgeClasses = 'border-purple-500/30 text-purple-400 bg-purple-500/5';

                      return (
                        <button
                          key={`${evt.title}-${index}`}
                          onClick={() => setSelectedDay({ day: dayNumber, month: activeMonth, year })}
                          className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-primary-500/5 bg-white/[0.01] hover:bg-primary-500/5 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary-500/10 border border-primary-500/15 group-hover:border-primary-500/30 transition-colors">
                              <span className="text-xs font-black text-primary-300">{dayNumber}</span>
                              <span className="text-[8px] font-bold text-primary-500/80 uppercase">{weekday}</span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-primary-200 truncate group-hover:text-primary-300 transition-colors">{evt.title}</h5>
                              {evt.subtitle && <p className="text-[10px] text-primary-500/60 truncate mt-0.5">{evt.subtitle}</p>}
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[8px] tracking-wider uppercase shrink-0 ${typeBadgeClasses}`}>
                            {evt.type}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
