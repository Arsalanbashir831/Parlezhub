import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATEGORIES, ANALYSIS_TOPICS, ASTRO_CHART_TYPES, LEFT_MENU_ITEMS } from '@/constants/astrology';
import { ROUTES } from '@/constants/routes';
import { analysisTopicPath, astrologyChatHref, astrologyHref, filterAnalysisTopics, profileHref } from '@/lib/astrology-navigation';

const root = ROUTES.AGENT.ASTROLOGY.ROOT;

describe('astrology navigation and feature preservation', () => {
  it.each(LEFT_MENU_ITEMS)('keeps $id on its existing insight route', ({ id }) => {
    expect(ANALYSIS_TOPICS.find(topic => topic.id === id)).toBeDefined();
    expect(analysisTopicPath(id)).toBe(`/astrology/insights/${id}`);
  });
  it('keeps Navatara and chart variants discoverable', () => {
    expect(analysisTopicPath('navatara')).toBe(ROUTES.AGENT.ASTROLOGY.NAVATARA);
    expect(analysisTopicPath('charts')).toBe(root);
    for (const chart of ASTRO_CHART_TYPES) expect(filterAnalysisTopics(chart.id)).toContainEqual(ANALYSIS_TOPICS.find(topic => topic.id === 'charts'));
  });
  it('assigns every topic to a real category without duplicate identifiers', () => {
    expect(new Set(ANALYSIS_TOPICS.map(topic => topic.id)).size).toBe(ANALYSIS_TOPICS.length);
    for (const topic of ANALYSIS_TOPICS) expect(ANALYSIS_CATEGORIES.some(category => category.id === topic.category)).toBe(true);
  });
  it('finds both traditional and friendly labels', () => {
    expect(filterAnalysisTopics('SAV').map(topic => topic.id)).toEqual(['prosperity_sav']);
    expect(filterAnalysisTopics('LAGNA LORD').map(topic => topic.id)).toEqual(['lagna_lord']);
    expect(filterAnalysisTopics('supportive planets').map(topic => topic.id)).toEqual(['benefic_planets']);
    expect(filterAnalysisTopics('avasthas').map(topic => topic.id)).toEqual(['planetary_states']);
  });
  it('supports category filters, blank search and no results', () => {
    expect(filterAnalysisTopics('  ').length).toBe(ANALYSIS_TOPICS.length);
    expect(filterAnalysisTopics('', 'advanced').map(topic => topic.id)).toEqual(['astro_energy', 'btr']);
    expect(filterAnalysisTopics('SAV', 'planets')).toEqual([]);
    expect(filterAnalysisTopics('not-a-topic')).toEqual([]);
  });
  it('does not create a trailing question mark', () => expect(astrologyHref(root)).toBe(root));
  it('retains guest context on every primary destination', () => {
    for (const path of [root, ROUTES.AGENT.ASTROLOGY.ANALYSIS, ROUTES.AGENT.ASTROLOGY.CHAT, ROUTES.AGENT.ASTROLOGY.DASHA, ROUTES.AGENT.ASTROLOGY.PROFILE, ROUTES.AGENT.ASTROLOGY.PROFILES, ROUTES.AGENT.ASTROLOGY.SHARE, ROUTES.AGENT.ASTROLOGY.REPORTS, ROUTES.AGENT.ASTROLOGY.FESTIVAL_CALENDAR]) {
      expect(new URL(astrologyHref(path, 'guest_id=42'), 'http://localhost').searchParams.get('guest_id')).toBe('42');
    }
  });
  it('preserves chart and transit controls only on dashboard links', () => {
    const params = 'student_id=s1&chart_type=d9&transit_date=2026-10-29&mode=natal&question=private&category=medical';
    expect(astrologyHref(root, params)).toBe('/astrology?student_id=s1&chart_type=d9&transit_date=2026-10-29&mode=natal');
    expect(astrologyHref(ROUTES.AGENT.ASTROLOGY.REPORTS, params)).toBe('/astrology/reports?student_id=s1');
  });
  it('never sends guest and shared-student identifiers together', () => expect(astrologyHref(root, 'guest_id=g1&student_id=s1')).toBe('/astrology?student_id=s1'));
  it('switches profiles without leaving another profile’s question behind', () => {
    expect(profileHref(ROUTES.AGENT.ASTROLOGY.CHAT, 'student_id=s1&question=old&category=medical', { type: 'guest', id: '99' })).toBe('/astrology/chat?guest_id=99');
    expect(profileHref(root, 'guest_id=99&chart_type=d9', { type: 'me' })).toBe('/astrology?chart_type=d9');
    expect(profileHref(ROUTES.AGENT.ASTROLOGY.PROFILE, 'student_id=s1', { type: 'guest', id: '17' })).toBe('/astrology/profile?guest_id=17');
  });
  it('creates explicit draft-only chat context and encodes question text', () => {
    const href = astrologyChatHref('guest_id=9&question=old', 'dasha', 'Explain Mars & Moon?');
    const params = new URL(href, 'http://localhost').searchParams;
    expect(params.get('guest_id')).toBe('9');
    expect(params.get('category')).toBe('dasha');
    expect(params.get('question')).toBe('Explain Mars & Moon?');
    expect(href).not.toContain('& Moon');
  });
});
