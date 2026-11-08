'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Compass, Hourglass, Moon, Orbit, Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { ANALYSIS_CATEGORIES, ASTRO_CHART_TYPES } from '@/constants/astrology';
import { useBirthProfile, useDasha, useNatalChart, useTransits } from '@/hooks/useAstrology';
import { astrologyChatHref, astrologyHref } from '@/lib/astrology-navigation';
import type { DivisionalChart } from '@/types/astrology';
import type { ChartSelection } from '@/components/agents/astrology/components/vedic-chart';
import ChartTypeSelector from '@/components/agents/astrology/components/chart-type-selector';
import TransitDateSelector from '@/components/agents/astrology/components/transit-date-selector';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { EmptyNotice, LoadingLayout, Refreshing, RequestError, Skeleton, SkeletonText } from '@/components/agents/astrology/ui/observatory-state';

const VedicChart = dynamic(() => import('@/components/agents/astrology/components/vedic-chart'), { loading: () => <div role="status" className="mx-auto aspect-square w-full max-w-[560px] obs-skeleton rounded-full" /> });
const AstroDetailsTable = dynamic(() => import('@/components/agents/astrology/components/astro-details-table'));
const DivisionalChartAnalysis = dynamic(() => import('@/components/agents/astrology/components/divisional-chart-analysis'));

const CATEGORY_TONES: Record<string, string> = { planets: 'orange', career: 'gold', relationships: 'deep', advanced: 'nebula' };

function DashboardSkeleton() {
  return <LoadingLayout label="Loading your observatory" className="gap-7">
    <div className="space-y-3"><Skeleton className="h-3 w-48" rounded="rounded-md" /><Skeleton className="h-10 w-[22rem] max-w-full" rounded="rounded-lg" /><Skeleton className="h-4 w-72 max-w-full" rounded="rounded-md" /></div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className={`obs-card space-y-3 p-4 sm:p-5${index === 2 ? ' col-span-2 md:col-span-1' : ''}`} aria-hidden="true"><Skeleton className="h-3 w-32" rounded="rounded-md" /><Skeleton className="h-7 w-40 max-w-full" rounded="rounded-md" /><Skeleton className="h-3 w-24" rounded="rounded-md" /></div>)}</div>
    <div className="obs-card space-y-6 p-5 sm:p-6" aria-hidden="true">
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-3 w-40" rounded="rounded-md" /><Skeleton className="h-6 w-56 max-w-full" rounded="rounded-md" /></div><Skeleton className="h-9 w-44" rounded="rounded-xl" /></div>
      <div className="flex flex-wrap gap-3">{[0, 1, 2].map(index => <Skeleton key={index} className="h-11 w-32" rounded="rounded-xl" />)}</div>
      <div className="grid min-w-0 items-start gap-6 min-[1440px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <Skeleton className="mx-auto aspect-square w-full max-w-[560px]" rounded="rounded-full" />
        <div className="space-y-4"><Skeleton className="h-3 w-32" rounded="rounded-md" /><SkeletonText lines={5} /><Skeleton className="h-11 w-full" rounded="rounded-xl" /></div>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(index => <Skeleton key={index} className="h-44" rounded="rounded-[20px]" />)}</div>
  </LoadingLayout>;
}

/** Holds the chart workspace's own shape while the calculation service answers. */
function ChartSkeleton() {
  return <LoadingLayout label="Loading chart calculations" className="grid min-w-0 items-start gap-6 p-5 sm:p-6 min-[1440px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
    <div className="min-w-0 space-y-4"><Skeleton className="mx-auto aspect-square w-full max-w-[560px]" rounded="rounded-full" /><div className="flex justify-center"><Skeleton className="h-3 w-56 max-w-full" rounded="rounded-md" /></div></div>
    <div className="hidden min-w-0 gap-4 md:flex md:flex-col"><Skeleton className="h-3 w-32" rounded="rounded-md" /><Skeleton className="h-8 w-40 max-w-full" rounded="rounded-md" /><SkeletonText lines={3} /><div className="grid grid-cols-2 gap-4 pt-1">{[0, 1, 2, 3].map(index => <div key={index} className="space-y-2"><Skeleton className="h-3 w-20" rounded="rounded-md" /><Skeleton className="h-4 w-24 max-w-full" rounded="rounded-md" /></div>)}</div><Skeleton className="h-11 w-full" rounded="rounded-xl" /></div>
  </LoadingLayout>;
}

export default function AstrologyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = studentId ? undefined : searchParams.get('guest_id') || undefined;
  const search = searchParams.toString();
  const requestedChart = searchParams.get('chart_type') || 'd1';
  const config = ASTRO_CHART_TYPES.find(chart => chart.id === requestedChart) || ASTRO_CHART_TYPES[0];
  const chartType = config.id;
  const overlay = chartType === 'd1' && searchParams.get('mode') !== 'natal';
  const profileQuery = useBirthProfile(studentId, guestId);
  const profile = profileQuery.data;
  const natal = useNatalChart(!!profile, studentId, guestId);
  const sky = useTransits(!!profile && chartType === 'd1', studentId, guestId, searchParams.get('transit_date') || undefined);
  const dasha = useDasha(!!profile, studentId, guestId);
  const [selection, setSelection] = useState<(ChartSelection & { chart: string }) | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const chartData = natal.data ? (natal.data as unknown as Record<string, DivisionalChart | undefined>)[`${chartType}_chart`] : undefined;
  const selectedIdentity = selection?.chart === chartType && (!selection.isTransit || overlay) ? selection : null;
  const selectedTransit = selectedIdentity?.isTransit ? sky.data?.transits.find(position => position.planet === selectedIdentity.planet) : undefined;
  const selectedNatal = chartData?.positions.find(position => position.planet === (selectedIdentity?.planet || 'Ascendant'));
  const selected = selectedIdentity?.isTransit ? selectedTransit ? { planet: selectedTransit.planet, sign: selectedTransit.sign, degree: selectedTransit.longitude % 30, isTransit: true } : null : selectedNatal ? { ...selectedNatal, isTransit: false } : null;
  const graha = selected && !selected.isTransit ? chartData?.graha_details?.find(row => row.graha === selected.planet) : undefined;
  const transit = selected?.isTransit ? sky.data?.transits.find(row => row.planet === selected.planet) : undefined;
  const name = profile?.guest_name || profile?.user_name || 'My chart';
  const nakshatraLord = natal.data?.planets.find(planet => planet.planet === 'Moon')?.nakshatra_lord;

  useEffect(() => {
    if (profileQuery.isSuccess && profile === null && !studentId && !guestId) router.replace(astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILE, search));
  }, [profileQuery.isSuccess, profile, studentId, guestId, router, search]);

  if (profileQuery.isLoading) return <DashboardSkeleton />;
  if (profileQuery.isError) return <RequestError className="p-6 sm:p-8" title="Could not load your birth profile" message="Your saved details have not been changed. This is a connection or service problem, not a problem with your chart." onRetry={() => profileQuery.refetch()} retrying={profileQuery.isFetching}><Link className="obs-control mt-1 text-xs" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILES, search)}>Manage birth profiles</Link></RequestError>;
  if (!profile) return studentId || guestId ? <EmptyNotice title="Birth details are not available" message={studentId ? 'The profile owner needs to add their birth details before this chart can be viewed.' : 'Add birth details for this guest to generate their chart.'} action={!studentId ? <Link className="obs-control obs-accent text-xs" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILE, search)}>Add birth details</Link> : undefined} /> : <DashboardSkeleton />;

  const placementDetails = <div className="space-y-5">
    <div><p className="obs-label">{selected?.isTransit ? 'Transit placement' : 'Chart placement'}</p><h3 className="mt-2 text-2xl font-medium">{selected?.planet || 'Explore a placement'}</h3><p className="mt-2 text-sm text-muted-foreground">{selected ? `${selected.sign} · ${selected.degree.toFixed(2)}°` : 'Select a planet on the chart to see its details.'}</p></div>
    {graha && <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm"><div><dt className="text-xs text-muted-foreground">House (Bhava)</dt><dd className="mt-1">{graha.current_bhava}</dd></div><div><dt className="text-xs text-muted-foreground">Nakshatra</dt><dd className="mt-1">{graha.nakshatra} · Pada {graha.nakshatra_pada}</dd></div><div><dt className="text-xs text-muted-foreground">Nakshatra ruler</dt><dd className="mt-1">{graha.nakshatra_lord}</dd></div><div><dt className="text-xs text-muted-foreground">Houses ruled</dt><dd className="mt-1">{graha.rules_bhavas.join(', ') || 'None'}</dd></div></dl>}
    {transit && <><p className="text-sm text-muted-foreground">House from natal Moon: {transit.house_from_moon} · {transit.speed_per_day < 0 ? 'Retrograde' : 'Direct'}</p><p className="obs-label">Traditional interpretation · calculation service</p><p className="obs-muted text-sm leading-relaxed">{transit.interpretation}</p></>}
    {!transit && <p className="obs-muted text-sm leading-relaxed">The ascendant marks the rising sign. Houses describe areas of life in traditional astrology; placements are chart facts, not predictions.</p>}
    <div className="flex flex-col gap-3 border-t border-border pt-5"><Link className="obs-control obs-accent justify-between" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, search)}>Explore Chart Analysis<ArrowUpRight className="h-4 w-4" /></Link>{!studentId && <Link className="text-sm text-[var(--solar-gold)]" href={astrologyChatHref(search, 'divisional-charts', selected ? `Explain ${selected.planet} in ${selected.sign} at ${selected.degree.toFixed(2)} degrees in my ${config.title}${selected.isTransit ? ' transit overlay' : ''}. Distinguish chart facts from traditional interpretation.` : undefined)}>Ask about this placement <ArrowRight className="inline h-4 w-4" /></Link>}</div>
  </div>;

  return <div className="space-y-6 sm:space-y-7">
    <header className="relative overflow-hidden pb-1"><div className="obs-orbit" aria-hidden="true" /><p className="obs-label mb-3">Your personal observatory</p><h1 className="obs-title break-words">{guestId || studentId ? `${name}’s chart` : `Welcome back, ${name}.`}</h1><p className="obs-muted mt-3 max-w-2xl text-sm">Explore your birth chart and current planetary periods.</p><p className="mt-3 text-xs text-muted-foreground">{profile.city}, {profile.country_code} · Birth timezone: {profile.timezone_str}</p></header>
    {/* Two up on phones (the sky summary spans both), three across from md. */}
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      <Link href={astrologyHref(ROUTES.AGENT.ASTROLOGY.NAVATARA, search)} data-tone="gold" className="obs-tile min-w-0 p-4 sm:p-5"><div className="flex items-center justify-between"><p className="obs-label">Birth Nakshatra</p><Moon className="h-5 w-5 text-[var(--solar-orange)]" /></div>{natal.isLoading ? <Skeleton className="mt-4 h-7 w-40 max-w-full" rounded="rounded-md" /> : <h2 className="mt-3 break-words text-lg font-medium sm:mt-4 sm:text-xl">{natal.data?.nakshatra || 'Not available'}</h2>}<p className="mt-2 text-xs text-muted-foreground">{nakshatraLord ? `Ruler: ${nakshatraLord}` : 'Your birth Moon’s lunar mansion'}</p></Link>
      <Link href={astrologyHref(ROUTES.AGENT.ASTROLOGY.DASHA, search)} className="obs-tile min-w-0 p-4 sm:p-5"><div className="flex items-center justify-between"><p className="obs-label">Current Dasha</p><Hourglass className="h-5 w-5 text-[var(--solar-gold)]" /></div>{dasha.isLoading ? <Skeleton className="mt-4 h-7 w-40 max-w-full" rounded="rounded-md" /> : <h2 className="mt-3 break-words text-lg font-medium sm:mt-4 sm:text-xl">{dasha.data?.current_period?.mahadasha || 'Not available'}</h2>}<p className="mt-2 text-xs text-muted-foreground">{dasha.data?.current_period?.antardasha ? `${dasha.data.current_period.antardasha} sub-period · until ${dasha.data.current_period.antardasha_end}` : 'View the timeline for details'}</p></Link>
      <div data-tone="nebula" className="obs-tile col-span-2 min-w-0 p-4 sm:p-5 md:col-span-1"><div className="flex items-center justify-between"><p className="obs-label">{chartType === 'd1' ? 'The current sky' : 'Chart identity'}</p><Orbit className="h-5 w-5 text-[var(--nebula-violet)]" /></div>{(chartType === 'd1' ? sky.isLoading : natal.isLoading) ? <Skeleton className="mt-4 h-7 w-40 max-w-full" rounded="rounded-md" /> : <h2 className="mt-3 break-words text-lg font-medium sm:mt-4 sm:text-xl">{chartType === 'd1' ? sky.data?.summary?.overall_quality || 'Not available' : natal.data?.ascendant?.rashi || 'Not available'}</h2>}<p className="mt-2 text-xs leading-relaxed text-muted-foreground">{chartType === 'd1' ? sky.data ? `Calculation date: ${sky.data.transit_date} · ${sky.data.ayanamsa} ayanamsa` : 'Transit summary from the calculation service' : 'Natal ascendant · rising sign'}</p></div>
    </div>
    <section className="obs-card overflow-hidden" aria-labelledby="chart-heading">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 sm:p-6"><div><p className="obs-label mb-2">Birth chart workspace</p><h2 id="chart-heading" className="text-xl font-medium">{config.title}</h2>{natal.isLoading ? <Skeleton className="mt-2 h-3 w-64 max-w-full" rounded="rounded-md" /> : <p className="mt-2 text-xs text-muted-foreground">{natal.data ? `Moon: ${natal.data.moon_sign} · Sun: ${natal.data.sun_sign} · Ascendant: ${natal.data.ascendant.rashi}` : 'Chart identity is not available for this selection.'}</p>}</div><Link className="obs-control obs-accent text-xs" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, search)}><Compass className="h-4 w-4" />Explore analysis</Link></div>
      <div className="flex flex-wrap items-end gap-4 border-b border-border p-5 sm:p-6"><ChartTypeSelector />{chartType === 'd1' && <><div className="w-full sm:w-auto"><p className="mb-2 text-xs text-muted-foreground">Chart mode</p><div className="grid grid-cols-2 gap-2 sm:flex">{['natal', 'overlay'].map(mode => <button key={mode} className="obs-control text-xs" aria-pressed={mode === (overlay ? 'overlay' : 'natal')} onClick={() => { const params = new URLSearchParams(search); params.set('mode', mode); router.replace(`${ROUTES.AGENT.ASTROLOGY.ROOT}?${params}`, { scroll: false }); }}>{mode === 'natal' ? 'Natal' : 'Transit overlay'}</button>)}</div></div>{overlay && <TransitDateSelector />}</>}</div>
      {natal.isError && <RequestError className="m-5 sm:m-6" title="Could not load chart calculations" message="Your birth details are saved and unchanged. The calculation service did not answer, so no placements are shown." onRetry={() => natal.refetch()} retrying={natal.isFetching} />}
      {natal.isLoading && <ChartSkeleton />}
      {!natal.isLoading && !natal.isError && (chartData ? <div className="grid min-w-0 items-start min-[1440px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <div className="min-w-0 p-2 sm:p-6"><div className="mx-auto w-full max-w-[760px]"><VedicChart key={chartType} title={config.title} natalPlanets={chartData.positions} transitPlanets={overlay ? sky.data?.transits || [] : []} onSelectPlanet={value => { setSelection({ ...value, chart: chartType }); if (window.matchMedia('(max-width: 767px)').matches) setDetailOpen(true); }} /></div><p className="mt-3 text-center text-xs text-muted-foreground">Select a planet for details. Labels may be spaced apart for readability.</p>{overlay && sky.isFetching && <div className="mt-3 flex justify-center"><Refreshing label="Updating transit positions…" /></div>}{overlay && sky.isError && <RequestError className="m-4" title="Transit positions could not be loaded" message="Your natal chart is unchanged. Only the current-sky overlay is missing." onRetry={() => sky.refetch()} retrying={sky.isFetching} retryLabel="Retry transits" />}</div>
        <div className="hidden min-w-0 border-t border-border p-6 md:block min-[1440px]:border-l min-[1440px]:border-t-0">{placementDetails}</div><button className="obs-control m-4 w-[calc(100%-2rem)] md:hidden" onClick={() => setDetailOpen(true)}>View placement details</button>
      </div> : <EmptyNotice className="m-5 sm:m-6" title="This chart is not available" message="The calculation service did not return a chart for this selection. Choose another chart type above." />)}
    </section>
    {chartData && <section className="space-y-6" aria-label="Planetary and house details"><AstroDetailsTable key={chartType} grahaDetails={chartData.graha_details} bhavaDetails={chartData.bhava_details} /><DivisionalChartAnalysis chartType={chartType} studentId={studentId} guestProfileId={guestId} /></section>}
    {!studentId && <section className="obs-card p-5 sm:p-6" aria-labelledby="ask-heading"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-[var(--solar-gold)]" /><h2 id="ask-heading" className="text-lg font-medium">A question about your chart?</h2></div><p className="obs-muted mt-2 text-sm">Explore an interpretation with your AI Vedic astrologer.</p><form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={event => { event.preventDefault(); router.push(astrologyChatHref(search, 'divisional-charts', question.trim() || undefined)); }}><input aria-label="Question for AI astrologer" value={question} onChange={event => setQuestion(event.target.value)} placeholder="What would you like to understand?" className="obs-control min-w-0 flex-1 justify-start" maxLength={5000} /><button className="obs-button" type="submit">Ask astrologer<ArrowRight className="h-4 w-4" /></button></form><div className="mt-3 flex flex-wrap gap-2">{[{ label: 'Understand my chart', category: 'divisional-charts', question: 'Explain my birth chart in simple terms.' }, { label: 'Explore my Dasha', category: 'dasha', question: 'Help me understand my current Dasha.' }, { label: 'Career indicators', category: 'prosperity_sav', question: 'Explain the traditional career indicators in my chart.' }].map(item => <Link key={item.label} className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground" href={astrologyChatHref(search, item.category, item.question)}>{item.label}<ArrowUpRight className="ml-2 h-3 w-3" /></Link>)}</div></section>}
    <section aria-labelledby="explore-chart-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="explore-chart-heading" className="text-lg font-medium">Explore your chart</h2>
        <Link className="obs-control obs-accent gap-2" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, search)}>All analyses<ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ANALYSIS_CATEGORIES.filter(category => category.id in CATEGORY_TONES).map(category => {
          const href = astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, search);
          return <Link key={category.id} data-tone={CATEGORY_TONES[category.id]} className="obs-tile group flex flex-col justify-between gap-4 p-4 sm:min-h-44 sm:gap-5 sm:p-5" href={`${href}${href.includes('?') ? '&' : '?'}category=${category.id}`}>
            <div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-foreground">{category.title}</h3><p className="obs-muted mt-2 text-sm leading-relaxed">{category.description}</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--tile-tone)_35%,transparent)] bg-[color-mix(in_srgb,var(--tile-tone)_14%,transparent)] text-[var(--solar-gold)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--tile-tone)_28%,transparent)]"><ArrowUpRight className="h-4 w-4" /></span></div>
            <span className="text-xs font-semibold text-[var(--solar-gold)]">View analysis</span>
          </Link>;
        })}
      </div>
    </section>
    <Sheet open={detailOpen} onOpenChange={setDetailOpen}><SheetContent side="bottom" className="observatory-theme max-h-[85dvh] overflow-y-auto rounded-t-2xl border-border"><SheetTitle className="sr-only">Placement details</SheetTitle><SheetDescription className="sr-only">Chart facts and links to related interpretations.</SheetDescription>{placementDetails}</SheetContent></Sheet>
  </div>;
}
