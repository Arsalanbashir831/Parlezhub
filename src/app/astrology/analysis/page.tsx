'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, Search, Compass } from 'lucide-react';
import { ANALYSIS_CATEGORIES, ANALYSIS_TOPICS } from '@/constants/astrology';
import { ROUTES } from '@/constants/routes';
import { analysisTopicPath, analysisTopicTone, astrologyHref, filterAnalysisTopics, topicTermBadges } from '@/lib/astrology-navigation';

export default function ChartAnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const requestedCategory = searchParams.get('category');
  const category = ANALYSIS_CATEGORIES.some(item => item.id === requestedCategory) ? requestedCategory! : 'all';
  const topics = filterAnalysisTopics(search, category);
  const countIn = (id: string) => ANALYSIS_TOPICS.filter(topic => topic.category === id).length;
  return <div className="space-y-7">
    <header className="relative overflow-hidden pb-2">
      <div className="obs-orbit" aria-hidden="true" />
      <p className="obs-label mb-3">Understand your chart</p>
      <h1 className="obs-title">A clearer view of your cosmos.</h1>
      <p className="obs-muted mt-3 max-w-2xl text-sm leading-relaxed">Start with a topic that interests you. Every traditional analysis is here, from planetary fundamentals to advanced techniques.</p>
    </header>
    <div className="obs-glass obs-search">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--solar-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--solar-gold)_14%,transparent)]">
        <Search className="h-4 w-4 text-[var(--solar-gold)]" />
      </span>
      <input value={search} onChange={event => setSearch(event.target.value)} aria-label="Search chart analyses" placeholder="Search a topic or Vedic term, such as Lagna or SAV…" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
      {search && <button type="button" onClick={() => setSearch('')} className="obs-chip shrink-0" data-tone="gold">Clear</button>}
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Analysis categories">
      {[{ id: 'all', title: 'All topics' }, ...ANALYSIS_CATEGORIES].map(item => <button key={item.id} className="obs-control gap-2 px-3 text-xs" aria-pressed={category === item.id} onClick={() => {
        const href = astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, searchParams.toString());
        router.replace(`${href}${href.includes('?') ? '&' : '?'}category=${item.id}`, { scroll: false });
      }}>{item.title}<span className="text-[10px] font-normal opacity-70">{item.id === 'all' ? ANALYSIS_TOPICS.length : countIn(item.id)}</span></button>)}
    </div>
    <p className="text-xs text-muted-foreground" role="status">{topics.length} {topics.length === 1 ? 'topic' : 'topics'}{search ? ` matching “${search}”` : ' to explore'}</p>
    {topics.length === 0 && <div className="obs-glass flex flex-col items-start gap-3 p-8" data-tone="nebula"><Compass className="h-6 w-6 text-[var(--nebula-violet)]" /><h2 className="text-lg font-medium">No matching topics</h2><p className="obs-muted text-sm">Try a traditional term or choose another category.</p><button className="obs-control mt-1" onClick={() => setSearch('')}>Clear search</button></div>}
    {ANALYSIS_CATEGORIES.map(group => {
      const groupTopics = topics.filter(topic => topic.category === group.id);
      if (!groupTopics.length) return null;
      const groupTone = analysisTopicTone(groupTopics[0].id);
      return <section key={group.id} aria-labelledby={`category-${group.id}`}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 id={`category-${group.id}`} className="text-lg font-medium">{group.title}</h2>
          <span className="obs-chip" data-tone={groupTone}>{groupTopics.length}</span>
          <p className="obs-muted text-sm">{group.description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {groupTopics.map(topic => {
            const tone = analysisTopicTone(topic.id);
            const { shown, extra } = topicTermBadges(topic.terms);
            return <article key={topic.id} data-tone={tone} className="obs-glass flex min-w-0 flex-col p-5 sm:p-6">
              <Link href={astrologyHref(analysisTopicPath(topic.id), searchParams.toString())} className="group flex flex-1 flex-col" aria-label={`Open ${topic.title}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-[var(--solar-gold)]">{topic.title}</h3>
                  <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--glass-tone)_35%,transparent)] bg-[color-mix(in_srgb,var(--glass-tone)_14%,transparent)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--glass-tone)_28%,transparent)]"><ArrowUpRight className="h-4 w-4 text-[var(--glass-tone)]" /></span>
                </div>
                <p className="obs-muted mt-3 flex-1 text-sm leading-relaxed">{topic.description}</p>
              </Link>
              <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-border pt-4" role="group" aria-label={`Traditional terms for ${topic.title}`}>
                {shown.map(word => <span key={word} className="obs-chip" data-tone={tone}>{word}</span>)}
                {extra > 0 && <span className="text-[11px] text-muted-foreground">+{extra} more</span>}
                {topic.category === 'advanced' && <span className="obs-chip ml-auto" data-tone="rose">Advanced</span>}
              </div>
            </article>;
          })}
        </div>
      </section>;
    })}
    <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">These are traditional astrological interpretations, not medical, financial, or legal advice. Use them for reflection, not as a substitute for professional guidance.</p>
  </div>;
}
