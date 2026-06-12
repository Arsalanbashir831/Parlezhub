import { FileText, ScrollText, Star, Zap } from 'lucide-react';

const FEATURE_PILLS = [
  { icon: FileText, label: '20+ Pages' },
  { icon: Star, label: 'PDF Report' },
  { icon: Zap, label: 'Instant' },
] as const;

export function ReportPageHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-900/40 via-violet-900/20 to-background px-6 py-8 md:px-10 md:py-12">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Title + description */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/30 to-violet-500/30 text-primary-300">
              <ScrollText className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Vedic Astrology Report
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Unlock your comprehensive birth chart analysis — a 20+ page cosmic blueprint covering
            personality, career, relationships, health, spirituality, and your Dasha timeline.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {FEATURE_PILLS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-300"
            >
              <Icon className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
