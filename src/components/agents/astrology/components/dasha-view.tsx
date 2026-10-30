'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DEFAULT_PLANET_INSIGHT,
  PLANET_INSIGHTS,
  PLANET_META,
} from '@/constants/astrology';
import { MessageSquareText } from 'lucide-react';

import { DashaResponse, SubPeriod } from '@/types/astrology';
import { formatDate, getVimshottariSubdivisions } from '@/lib/astrology-utils';
import { planetTone } from '@/lib/astrology-navigation';
import { cn } from '@/lib/utils';
import ConversationPanel from '../chat/conversation-panel';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { CosmicWheel } from './cosmic-wheel';
import { MahadashaStrip } from './mahadasha-strip';
import { PeriodsTable } from './periods-table';

type SelectedPeriod = {
  planet: string;
  term: string;
  start_date?: string;
  end_date: string;
};

// General traditional associations, not interpretations of the selected birth chart.
const TRADITIONAL_MEANINGS: Record<string, string> = {
  Sun: 'Identity, authority, vitality, and leadership.',
  Moon: 'Emotions, the mind, nurturing, and home.',
  Mars: 'Energy, courage, initiative, and conflict.',
  Mercury: 'Communication, learning, analysis, and trade.',
  Jupiter: 'Wisdom, teaching, expansion, and generosity.',
  Venus: 'Relationships, harmony, creativity, and comforts.',
  Saturn: 'Discipline, responsibility, patience, and structure.',
  Rahu: 'Ambition, unfamiliar experiences, and unconventional paths.',
  Ketu: 'Detachment, introspection, and spiritual inquiry.',
};

const GLOSSARY = [
  {
    term: 'Vimshottari Dasha',
    meaning: 'A traditional 120-year planetary-period framework.',
  },
  { term: 'Mahadasha', meaning: 'The major planetary period.' },
  {
    term: 'Antardasha',
    meaning: 'Sub-period within the Mahadasha.',
  },
  {
    term: 'Pratyantardasha',
    meaning: 'Sub-period within the Antardasha.',
  },
  {
    term: 'Sukshma',
    meaning: 'Finer subdivision of the Pratyantardasha.',
  },
];

function progressFor(period: { start_date?: string; end_date: string }) {
  if (!period.start_date) return null;
  const start = new Date(period.start_date).getTime();
  const end = new Date(period.end_date).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return null;
  return Math.min(
    100,
    Math.max(0, ((Date.now() - start) / (end - start)) * 100)
  );
}

function PeriodProgress({ period }: { period: SelectedPeriod }) {
  const percent = progressFor(period);
  if (percent === null)
    return (
      <p className="text-sm text-muted-foreground">
        Progress unavailable: start and end dates are required.
      </p>
    );
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>Elapsed</span>
        <span className="font-medium tabular-nums text-foreground">
          {percent.toFixed(1)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${period.planet} ${period.term} elapsed time`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(percent.toFixed(1))}
        className="h-1.5 overflow-hidden rounded-full border border-border bg-black/60"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--solar-orange)] via-[var(--solar-gold)] to-[var(--solar-orange)] shadow-[0_0_14px_color-mix(in_srgb,var(--solar-orange)_45%,transparent)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function PeriodDates({ period }: { period: SelectedPeriod }) {
  return (
    <span className="block text-sm leading-relaxed text-muted-foreground">
      {period.start_date ? formatDate(period.start_date) : 'Start unavailable'}{' '}
      — {formatDate(period.end_date)}
    </span>
  );
}

function PlanetMark({
  planet,
  size = 'lg',
}: {
  planet: string;
  size?: 'lg' | 'sm';
}) {
  return (
    <span
      aria-hidden="true"
      data-tone={planetTone(planet)}
      className={cn(
        'obs-tile flex shrink-0 items-center justify-center text-primary-400',
        size === 'lg' ? 'h-14 w-14 text-2xl' : 'h-9 w-9 text-base'
      )}
    >
      {PLANET_META[planet]?.symbol}
    </span>
  );
}

interface DashaViewProps {
  data: DashaResponse;
  className?: string;
}

export function DashaView({ data, className }: DashaViewProps) {
  const searchParams = useSearchParams();
  const { current_period, current_antardashas, mahadasha_sequence } = data;
  const activeMahaName = current_period.mahadasha;
  // Only use supplied dates. Missing starts must not become invented timelines.
  const currentMahaItem = useMemo(
    () =>
      mahadasha_sequence.find(
        (m) => m.is_current && m.planet === activeMahaName
      ) ??
      mahadasha_sequence.find(
        (m) =>
          m.planet === activeMahaName &&
          new Date(m.end_date).getTime() ===
            new Date(current_period.mahadasha_end).getTime()
      ),
    [mahadasha_sequence, activeMahaName, current_period.mahadasha_end]
  );
  const currentAntarItem = useMemo(
    () =>
      current_antardashas.find((a) => a.is_current) ??
      current_antardashas.find(
        (a) =>
          a.planet === current_period.antardasha &&
          new Date(a.end_date).getTime() ===
            new Date(current_period.antardasha_end).getTime()
      ),
    [
      current_antardashas,
      current_period.antardasha,
      current_period.antardasha_end,
    ]
  );

  // Retain deterministic Vimshottari proportions for the nested periods.
  const pratyantardashas = useMemo(
    () =>
      currentAntarItem
        ? getVimshottariSubdivisions(
            currentAntarItem.start_date,
            currentAntarItem.end_date,
            currentAntarItem.planet
          )
        : [],
    [currentAntarItem]
  );
  const currentPratyantarItem = useMemo(
    () => pratyantardashas.find((p) => p.is_current),
    [pratyantardashas]
  );
  const sukshmas = useMemo(
    () =>
      currentPratyantarItem
        ? getVimshottariSubdivisions(
            currentPratyantarItem.start_date,
            currentPratyantarItem.end_date,
            currentPratyantarItem.planet
          )
        : [],
    [currentPratyantarItem]
  );
  const currentSukshmaItem = useMemo(
    () => sukshmas.find((s) => s.is_current),
    [sukshmas]
  );

  const currentMaha: SelectedPeriod = {
    planet: activeMahaName,
    term: 'Mahadasha',
    start_date: currentMahaItem?.start_date,
    end_date: currentMahaItem?.end_date ?? current_period.mahadasha_end,
  };
  const [selection, setSelection] = useState<{
    data: DashaResponse;
    period: SelectedPeriod;
  } | null>(null);
  // A profile change must never leave a selected period from the previous response.
  const selected = selection?.data === data ? selection.period : currentMaha;
  const handleSelect = (period: SelectedPeriod) =>
    setSelection({ data, period });

  const canAsk = !searchParams.get('student_id');
  const question = `Explain the traditional meaning of ${selected.planet} ${selected.term}, ${
    selected.start_date ? `from ${formatDate(selected.start_date)}` : 'with start date unavailable'
  } to ${formatDate(selected.end_date)}, for the selected birth profile. Distinguish the supplied period dates from interpretation and uncertainty; avoid guaranteed predictions.`;

  const subPeriods: { term: string; item?: SubPeriod; meaning: string }[] = [
    {
      term: 'Antardasha',
      item: currentAntarItem,
      meaning: 'Sub-period within the Mahadasha',
    },
    {
      term: 'Pratyantardasha',
      item: currentPratyantarItem,
      meaning: 'Sub-period within the Antardasha',
    },
    {
      term: 'Sukshma',
      item: currentSukshmaItem,
      meaning: 'Finer subdivision of the Pratyantardasha',
    },
  ];

  const insight = PLANET_INSIGHTS[selected.planet] ?? DEFAULT_PLANET_INSIGHT;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-6 text-foreground',
        className
      )}
    >
      <section
        data-tone={planetTone(activeMahaName)}
        className="obs-glass grid min-w-0 gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] xl:items-center"
      >
        <div className="flex min-w-0 items-start gap-4">
          <PlanetMark planet={activeMahaName} />
          <div className="min-w-0 space-y-1">
            <p className="obs-label">Current major period</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {activeMahaName} Mahadasha
            </h2>
            <PeriodDates period={currentMaha} />
          </div>
        </div>
        <div className="space-y-3">
          <PeriodProgress period={currentMaha} />
          <button
            type="button"
            className="obs-control w-full px-4 text-sm"
            onClick={() => handleSelect(currentMaha)}
          >
            Explain this period
          </button>
        </div>
      </section>

      <div className="grid min-w-0 gap-3 md:grid-cols-3">
        {subPeriods.map(({ term, item, meaning }) => {
          const period: SelectedPeriod | null = item
            ? { ...item, term }
            : term === 'Antardasha'
              ? {
                  planet: current_period.antardasha,
                  term,
                  end_date: current_period.antardasha_end,
                }
              : null;
          return (
            <section
              key={term}
              data-tone={planetTone(period?.planet ?? activeMahaName)}
              className={cn(
                'obs-tile flex min-w-0 flex-col gap-3 p-4',
                selected.term === term &&
                  selected.planet === period?.planet &&
                  'ring-2 ring-primary-400'
              )}
            >
              <div>
                <h3 className="text-sm font-semibold">{term}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {meaning}
                </p>
              </div>
              {period ? (
                <>
                  <div className="flex items-center gap-2">
                    <PlanetMark planet={period.planet} size="sm" />
                    <p className="text-lg font-bold leading-none">
                      {period.planet}
                    </p>
                  </div>
                  <PeriodDates period={period} />
                  <PeriodProgress period={period} />
                  <button
                    type="button"
                    className="obs-control mt-auto w-full px-3 text-sm"
                    onClick={() => handleSelect(period)}
                  >
                    Explain {period.planet}
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Dates unavailable for this subdivision.
                </p>
              )}
            </section>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold">Major period timeline</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a period to explore its dates and traditional meaning.
                  Scroll to see the full sequence.
                </p>
              </div>
              <span className="obs-chip">
                {mahadasha_sequence.length} periods
              </span>
            </div>
            {mahadasha_sequence.length ? (
              <MahadashaStrip
                sequence={mahadasha_sequence}
                activePlanet={activeMahaName}
                selectedStart={
                  selected.term === 'Mahadasha'
                    ? selected.start_date
                    : undefined
                }
                onSelect={(item) =>
                  handleSelect({ ...item, term: 'Mahadasha' })
                }
              />
            ) : (
              <p className="obs-card p-5 text-sm text-muted-foreground">
                No major-period sequence was returned.
              </p>
            )}
          </section>

          <section className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">
                Antardashas in {activeMahaName} Mahadasha
              </h2>
              {currentAntarItem && (
                <span className="obs-chip" data-tone="gold">
                  {currentAntarItem.planet} now
                </span>
              )}
            </div>
            {current_antardashas.length ? (
              <PeriodsTable
                antardashas={current_antardashas}
                selected={
                  selected.term === 'Antardasha' ? selected : undefined
                }
                onSelect={(item) =>
                  handleSelect({ ...item, term: 'Antardasha' })
                }
              />
            ) : (
              <p className="obs-card p-5 text-sm text-muted-foreground">
                No sub-period dates were returned.
              </p>
            )}
          </section>

          {[
            {
              title: 'Pratyantardasha subdivisions',
              items: pratyantardashas,
              term: 'Pratyantardasha',
              parent: currentAntarItem?.planet,
            },
            {
              title: 'Sukshma subdivisions',
              items: sukshmas,
              term: 'Sukshma',
              parent: currentPratyantarItem?.planet,
            },
          ].map(({ title, items, term, parent }) => (
            <section key={term} className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                {parent && (
                  <span className="obs-chip" data-tone="nebula">
                    within {parent}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Calculated using the existing Vimshottari proportions of the
                current parent period.
              </p>
              {items.length ? (
                <div
                  className="min-w-0 overflow-x-auto pb-2"
                  tabIndex={0}
                  aria-label={`${title} sequence`}
                >
                  <div className="flex min-w-max gap-2">
                    {items.map((item) => {
                      const isSelected =
                        selected.term === term &&
                        selected.start_date === item.start_date;
                      return (
                        <button
                          key={item.start_date}
                          type="button"
                          onClick={() => handleSelect({ ...item, term })}
                          aria-pressed={isSelected}
                          data-tone={planetTone(item.planet)}
                          className={cn(
                            'obs-tile flex min-w-[152px] flex-col items-start gap-1 p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400',
                            isSelected && 'ring-2 ring-primary-400'
                          )}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            <span aria-hidden="true" className="text-primary-400">
                              {PLANET_META[item.planet]?.symbol}
                            </span>
                            {item.planet}
                          </span>
                          {item.is_current && (
                            <span className="text-[11px] font-medium text-primary-400">
                              Current
                            </span>
                          )}
                          <PeriodDates period={{ ...item, term }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="obs-card p-4 text-sm text-muted-foreground">
                  Parent-period dates are unavailable.
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <section
            data-tone={planetTone(selected.planet)}
            className="obs-glass space-y-4 p-5 sm:p-6"
            aria-label="Selected period explanation"
          >
            <div className="flex items-start gap-3">
              <PlanetMark planet={selected.planet} size="sm" />
              <div className="min-w-0 space-y-1">
                <p className="obs-label">Selected period</p>
                <h2 className="text-xl font-semibold">
                  {selected.planet} {selected.term}
                </h2>
              </div>
            </div>
            <PeriodDates period={selected} />
            <PeriodProgress period={selected} />

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {TRADITIONAL_MEANINGS[selected.planet] ??
                  'A planetary period in the traditional Vimshottari system.'}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                General meanings, not a personalized prediction. Interpretation
                depends on the wider chart and is not medical, financial, or
                legal advice.
              </p>
            </div>

            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              {[
                { label: 'Favourable themes', items: insight.favorable },
                { label: 'Traditional cautions', items: insight.challenges },
              ].map(({ label, items }) => (
                <div key={label} className="min-w-0 space-y-2">
                  <h3 className="obs-label">{label}</h3>
                  <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground marker:text-primary-400">
                    {items.map((item) => (
                      <li key={item} className="list-disc pl-4">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {canAsk && (
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="obs-control obs-accent w-full gap-2"
                  >
                    <MessageSquareText className="h-4 w-4" />
                    Ask about this period
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-full max-w-[560px] flex-col gap-0 border-border bg-[var(--cosmos-900)] p-0 sm:max-w-[560px]"
                >
                  <SheetHeader className="border-b border-border py-4 pl-5 pr-12 text-left sm:pl-6">
                    <SheetTitle className="text-sm font-semibold">
                      Ask about {selected.planet} {selected.term}
                    </SheetTitle>
                    <SheetDescription className="mt-1 text-xs leading-relaxed">
                      Answers are drawn from your saved birth details and the
                      period dates above.
                    </SheetDescription>
                  </SheetHeader>
                  <ConversationPanel
                    category="dasha"
                    guestId={searchParams.get('guest_id') || undefined}
                    question={question}
                  />
                </SheetContent>
              </Sheet>
            )}
          </section>

          <section className="obs-card space-y-3 p-5">
            <h2 className="obs-label">Dasha terms</h2>
            <dl className="space-y-2.5 text-sm leading-relaxed">
              {GLOSSARY.map(({ term, meaning }) => (
                <div key={term} className="grid grid-cols-[auto_1fr] gap-3">
                  <dt className="font-medium text-foreground">{term}</dt>
                  <dd className="text-muted-foreground">{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="obs-card space-y-3 p-5">
            <h2 className="obs-label">Planetary period order</h2>
            <div aria-hidden="true">
              <CosmicWheel activePlanet={activeMahaName} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Current lord: {activeMahaName}. The wheel illustrates order, not
              period duration; the timeline above provides dates.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function DashaViewSkeleton() {
  return (
    <div
      role="status"
      className="grid min-w-0 gap-6 motion-safe:animate-pulse lg:grid-cols-3"
    >
      <span className="sr-only">Loading planetary periods…</span>
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="obs-card h-44" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="obs-card h-40" />
          ))}
        </div>
        <div className="obs-card h-64" />
      </div>
      <div className="obs-card h-80" />
    </div>
  );
}
