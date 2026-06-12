import { CheckCircle2 } from 'lucide-react';

const INCLUDED_ITEMS = [
  'Executive Summary & Life Overview',
  'Detailed Lagna & Rising Sign Analysis',
  'All Planetary Positions & Dignities',
  'Complete House (Bhava) Analysis',
  'Divisional Charts (D1 through D60)',
  'Vimshottari Dasha Timeline',
  'Career, Finance & Wealth Prospects',
  'Relationships & Marriage Compatibility',
  'Health & Wellness Indicators',
  'Spiritual Path & Dharma Analysis',
  'Remedies & Gemstone Recommendations',
] as const;

export function ReportIncludedPanel() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <h3 className="mb-4 text-sm font-semibold text-primary-300">What&apos;s Included</h3>
      <ul className="flex flex-col gap-3">
        {INCLUDED_ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
