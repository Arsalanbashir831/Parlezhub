'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TransitDateSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const transitDate = searchParams.get('transit_date') || undefined;

  const parsedDate = transitDate 
    ? new Date(
        parseInt(transitDate.split('-')[0]),
        parseInt(transitDate.split('-')[1]) - 1,
        parseInt(transitDate.split('-')[2])
      )
    : new Date();

  const handleDateSelect = (date: Date | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      params.set('transit_date', formattedDate);
    } else {
      params.delete('transit_date');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-3 rounded-2xl border border-primary-500/30 bg-primary-500/5 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">
          Transit Date:
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 px-3 py-2 text-sm font-bold border-primary-500/20 bg-background hover:bg-primary-500/10 text-slate-100 outline-none flex items-center gap-2 rounded-xl transition-[border-color,background-color] duration-200 hover:border-primary-500/40",
                !transitDate && "text-slate-400"
              )}
            >
              <CalendarIcon className="h-4 w-4 text-primary-400" />
              {transitDate ? format(parsedDate, "PPP") : "Select Transit Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border border-primary-500/30 bg-[#0c0f1d] text-slate-100 rounded-2xl shadow-xl shadow-primary-950/50" align="center">
            <Calendar
              mode="single"
              selected={parsedDate}
              onSelect={handleDateSelect}
              className="p-3 bg-transparent"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
