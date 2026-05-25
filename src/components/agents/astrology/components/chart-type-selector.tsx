'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ASTRO_CHART_TYPES } from '@/constants/astrology';

export default function ChartTypeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chartType = searchParams.get('chart_type') || 'd1';

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('chart_type', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-3 rounded-2xl border border-primary-500/30 bg-primary-500/5 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">
          Chart View:
        </span>
        <Select value={chartType} onValueChange={handleSelect}>
          <SelectTrigger className="h-9 w-[180px] text-sm font-bold border-primary-500/20 bg-background hover:bg-primary-500/10 text-slate-100 outline-none flex items-center justify-between rounded-xl transition-[border-color,background-color] duration-200 hover:border-primary-500/40 focus:ring-0 focus:ring-offset-0 focus:outline-none">
            <SelectValue placeholder="Select Chart Type" />
          </SelectTrigger>
          <SelectContent className="border border-primary-500/30 bg-[#0c0f1d] text-slate-100 rounded-2xl shadow-xl shadow-primary-950/50">
            {ASTRO_CHART_TYPES.map((chart) => (
              <SelectItem
                key={chart.id}
                value={chart.id}
                className="cursor-pointer focus:bg-primary-500/10 focus:text-primary-200"
              >
                {chart.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
