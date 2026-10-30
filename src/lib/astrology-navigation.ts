import { ANALYSIS_TOPICS } from '@/constants/astrology';
import { ROUTES } from '@/constants/routes';

export function astrologyHref(path: string, search: string | URLSearchParams = ''): string {
  const source = new URLSearchParams(search);
  const params = new URLSearchParams();
  const studentId = source.get('student_id');
  const guestId = source.get('guest_id');
  if (studentId) params.set('student_id', studentId);
  else if (guestId) params.set('guest_id', guestId);
  if (path === ROUTES.AGENT.ASTROLOGY.ROOT) {
    for (const key of ['chart_type', 'transit_date', 'mode']) {
      const value = source.get(key);
      if (value) params.set(key, value);
    }
  }
  const query = params.toString();
  return `${path}${query ? `?${query}` : ''}`;
}

export function profileHref(
  path: string,
  search: string | URLSearchParams,
  profile: { type: 'me' | 'student' | 'guest'; id?: string }
): string {
  const params = new URLSearchParams(search);
  params.delete('student_id');
  params.delete('guest_id');
  if (profile.type === 'student' && profile.id) params.set('student_id', profile.id);
  if (profile.type === 'guest' && profile.id) params.set('guest_id', profile.id);
  return astrologyHref(path, params);
}

export function analysisTopicPath(id: string): string {
  if (id === 'navatara') return ROUTES.AGENT.ASTROLOGY.NAVATARA;
  if (id === 'charts') return ROUTES.AGENT.ASTROLOGY.ROOT;
  return ROUTES.AGENT.ASTROLOGY.INSIGHTS(id);
}

const ANALYSIS_TONES = ['ember', 'gold', 'nebula', 'jade', 'deep', 'rose'] as const;
export type AnalysisTone = (typeof ANALYSIS_TONES)[number];
const TERM_FILLER = new Set(['and', 'of', 'the', 'for', 'to', 'a', 'an', 'your']);
const TOPIC_ORDER: string[] = ANALYSIS_TOPICS.map(topic => topic.id);

export function analysisTopicTone(id: string): AnalysisTone {
  return ANALYSIS_TONES[Math.max(0, TOPIC_ORDER.indexOf(id)) % ANALYSIS_TONES.length];
}

// Traditional karaka colours, mapped onto the ember-family tones the tiles understand.
const PLANET_TONES: Record<string, AnalysisTone> = {
  Sun: 'deep',
  Moon: 'gold',
  Mars: 'rose',
  Mercury: 'jade',
  Jupiter: 'gold',
  Venus: 'jade',
  Saturn: 'nebula',
  Rahu: 'nebula',
  Ketu: 'rose',
};

export function planetTone(planet: string): AnalysisTone {
  return PLANET_TONES[planet] ?? 'ember';
}

export function topicTerms(terms: string): string[] {
  return terms.split(' ').filter(word => word && !TERM_FILLER.has(word.toLowerCase()));
}

export function topicTermBadges(terms: string, limit = 3) {
  const words = topicTerms(terms);
  return { shown: words.slice(0, limit), extra: Math.max(0, words.length - limit) };
}

export function filterAnalysisTopics(search: string, category = 'all') {
  const words = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return ANALYSIS_TOPICS.filter(topic => {
    const haystack = `${topic.title} ${topic.terms} ${topic.description}`.toLocaleLowerCase();
    return (category === 'all' || topic.category === category) && words.every(word => haystack.includes(word));
  });
}

export function astrologyChatHref(search: string | URLSearchParams, category = 'divisional-charts', question?: string): string {
  const href = astrologyHref(ROUTES.AGENT.ASTROLOGY.CHAT, search);
  const [path, query] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('category', category);
  if (question) params.set('question', question);
  return `${path}?${params.toString()}`;
}
