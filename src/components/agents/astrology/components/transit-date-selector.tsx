'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format, isValid, parseISO } from 'date-fns';

export default function TransitDateSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get('transit_date');
  const value = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && isValid(parseISO(requested)) ? requested : format(new Date(), 'yyyy-MM-dd');
  const selectDate = (date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (date) params.set('transit_date', date);
    else params.delete('transit_date');
    router.push(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false });
  };
  return <div className="flex min-w-0 flex-wrap items-end gap-2">
    <label className="flex min-w-0 flex-col gap-2 text-xs text-muted-foreground">Transit date<input aria-label="Transit date" type="date" value={value} onChange={event => selectDate(event.target.value)} className="obs-control min-w-0 max-w-full" /></label>
    <button type="button" className="obs-control text-xs" onClick={() => selectDate('')}>Today</button>
  </div>;
}
