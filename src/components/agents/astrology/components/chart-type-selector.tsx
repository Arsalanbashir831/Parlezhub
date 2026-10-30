'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ASTRO_CHART_TYPES } from '@/constants/astrology';

export default function ChartTypeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get('chart_type') || 'd1';
  const chartType = ASTRO_CHART_TYPES.some(chart => chart.id === requested) ? requested : 'd1';
  return <label className="flex min-w-0 flex-col gap-2 text-xs text-muted-foreground">Chart
    <select aria-label="Chart type" className="obs-control w-full max-w-full sm:w-60" value={chartType} onChange={event => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('chart_type', event.target.value);
      router.push(`${pathname}?${params}`, { scroll: false });
    }}>{ASTRO_CHART_TYPES.map(chart => <option key={chart.id} value={chart.id}>{chart.label}</option>)}</select>
  </label>;
}
