'use client';

import { PLANET_META } from '@/constants/astrology';

import type { BhavaDetail, GrahaDetail } from '@/types/astrology';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AstroDetailsTableProps {
  grahaDetails?: GrahaDetail[];
  bhavaDetails?: BhavaDetail[];
}

const headingClass =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--solar-gold)]';
const theadClass =
  'border-b border-[color-mix(in_srgb,var(--solar-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--solar-gold)_14%,var(--surface-1))]';
const cellClass = 'px-4 py-4 text-sm text-foreground';
const rowClass =
  'border-t border-[color-mix(in_srgb,var(--solar-orange)_14%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_4%,var(--surface-1))] transition-colors even:bg-[color-mix(in_srgb,var(--solar-orange)_9%,var(--surface-1))] hover:bg-[color-mix(in_srgb,var(--solar-orange)_16%,var(--surface-1))]';
const mobileCardClass =
  'p-4 even:bg-[color-mix(in_srgb,var(--solar-orange)_7%,transparent)] sm:p-5';

function MobileField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="px-5 py-10 text-center text-sm text-muted-foreground">
      No {label} details are available for this chart.
    </p>
  );
}

export default function AstroDetailsTable({
  grahaDetails = [],
  bhavaDetails = [],
}: AstroDetailsTableProps) {
  return (
    <Tabs defaultValue="graha" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="obs-label">Chart reference</p>
          <h3 className="mt-1 text-base font-semibold">Placements & houses</h3>
        </div>
        <TabsList
          aria-label="Chart detail type"
          className="h-auto gap-1 rounded-xl border border-border bg-secondary p-1"
        >
          <TabsTrigger
            value="graha"
            className="min-h-10 rounded-lg px-4 text-sm font-medium text-muted-foreground data-[state=active]:bg-[var(--solar-orange)] data-[state=active]:text-black data-[state=active]:shadow-none"
          >
            Planets
          </TabsTrigger>
          <TabsTrigger
            value="bhava"
            className="min-h-10 rounded-lg px-4 text-sm font-medium text-muted-foreground data-[state=active]:bg-[var(--solar-orange)] data-[state=active]:text-black data-[state=active]:shadow-none"
          >
            Houses
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="graha"
        className="m-0 overflow-hidden rounded-2xl border border-border bg-[var(--surface-1)]"
      >
        {grahaDetails.length === 0 ? (
          <EmptyState label="planetary" />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <caption className="sr-only">
                  Planetary positions and the houses they rule
                </caption>
                <thead className={theadClass}>
                  <tr>
                    <th scope="col" className={headingClass}>
                      Planet
                    </th>
                    <th scope="col" className={headingClass}>
                      Position
                    </th>
                    <th scope="col" className={headingClass}>
                      Nakshatra
                    </th>
                    <th scope="col" className={headingClass}>
                      Lord / sublord
                    </th>
                    <th scope="col" className={headingClass}>
                      Rules houses
                    </th>
                    <th scope="col" className={headingClass}>
                      In house
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grahaDetails.map((row, index) => (
                    <tr key={`${row.graha}-${index}`} className={rowClass}>
                      <th
                        scope="row"
                        className={`${cellClass} whitespace-nowrap font-semibold`}
                      >
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--solar-orange)_14%,transparent)] text-lg text-[var(--solar-gold)]"
                          aria-hidden="true"
                        >
                          {PLANET_META[row.graha]?.symbol ?? '✦'}
                        </span>
                        <span className="ml-3">{row.graha}</span>
                      </th>
                      <td
                        className={`${cellClass} whitespace-nowrap font-medium tabular-nums`}
                      >
                        <span className="text-[var(--solar-gold)]">
                          {row.longitude_degree.toFixed(2)}°
                        </span>{' '}
                        <span className="text-muted-foreground">
                          {row.longitude_rashi}
                        </span>
                      </td>
                      <td className={`${cellClass} whitespace-nowrap`}>
                        {row.nakshatra}
                        <span className="ml-1 text-muted-foreground">
                          · Pada {row.nakshatra_pada}
                        </span>
                      </td>
                      <td className={`${cellClass} whitespace-nowrap`}>
                        {row.nakshatra_lord}
                        <span className="mx-1 text-muted-foreground">/</span>
                        {row.nakshatra_sublord}
                      </td>
                      <td className={cellClass}>
                        {row.rules_bhavas.join(', ') || '—'}
                      </td>
                      <td className={`${cellClass} font-semibold tabular-nums`}>
                        {row.current_bhava}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border lg:hidden">
              {grahaDetails.map((row, index) => (
                <article key={`${row.graha}-${index}`} className={mobileCardClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="flex items-center gap-3 text-base font-semibold">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xl text-[var(--solar-gold)]"
                        aria-hidden="true"
                      >
                        {PLANET_META[row.graha]?.symbol ?? '✦'}
                      </span>
                      {row.graha}
                    </h4>
                    <span className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-medium tabular-nums text-[var(--solar-gold)]">
                      {row.longitude_degree.toFixed(2)}° {row.longitude_rashi}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4">
                    <MobileField label="Nakshatra">
                      {row.nakshatra} · Pada {row.nakshatra_pada}
                    </MobileField>
                    <MobileField label="Lord / sublord">
                      {row.nakshatra_lord} / {row.nakshatra_sublord}
                    </MobileField>
                    <MobileField label="Rules houses">
                      {row.rules_bhavas.join(', ') || '—'}
                    </MobileField>
                    <MobileField label="In house">
                      {row.current_bhava}
                    </MobileField>
                  </dl>
                </article>
              ))}
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent
        value="bhava"
        className="m-0 overflow-hidden rounded-2xl border border-border bg-[var(--surface-1)]"
      >
        {bhavaDetails.length === 0 ? (
          <EmptyState label="house" />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  House signs, residents, and owners
                </caption>
                <thead className={theadClass}>
                  <tr>
                    <th scope="col" className={headingClass}>
                      House
                    </th>
                    <th scope="col" className={headingClass}>
                      Sign
                    </th>
                    <th scope="col" className={headingClass}>
                      Resident planets
                    </th>
                    <th scope="col" className={headingClass}>
                      Owner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bhavaDetails.map((row) => (
                    <tr key={row.bhava} className={rowClass}>
                      <th
                        scope="row"
                        className={`${cellClass} font-semibold tabular-nums`}
                      >
                        <span className="mr-2 text-[var(--solar-gold)]">
                          {String(row.bhava).padStart(2, '0')}
                        </span>{' '}
                        House
                      </th>
                      <td className={`${cellClass} font-medium`}>
                        {row.rashi}
                      </td>
                      <td className={cellClass}>
                        {row.residents.join(', ') || '—'}
                      </td>
                      <td className={cellClass}>{row.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border lg:hidden">
              {bhavaDetails.map((row) => (
                <article key={row.bhava} className={mobileCardClass}>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold">
                      <span className="mr-2 text-[var(--solar-gold)]">
                        {String(row.bhava).padStart(2, '0')}
                      </span>{' '}
                      House
                    </h4>
                    <span className="text-sm font-medium text-[var(--solar-gold)]">
                      {row.rashi}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <MobileField label="Resident planets">
                      {row.residents.join(', ') || '—'}
                    </MobileField>
                    <MobileField label="Owner">{row.owner}</MobileField>
                  </dl>
                </article>
              ))}
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
