import { SubPeriod } from '@/types/astrology';
import { PLANET_ORDER, PLANET_YEARS } from '@/constants/astrology';

/**
 * Mathematically subdivides a given parent period into 9 sub-periods 
 * in deterministic circular Vimshottari proportion.
 */
export function getVimshottariSubdivisions(
  startDateStr: string,
  endDateStr: string,
  parentPlanet: string
): SubPeriod[] {
  try {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const totalMs = end - start;
    if (totalMs <= 0) return [];

    // Find the starting index (parent planet)
    const startIndex = PLANET_ORDER.indexOf(parentPlanet);
    if (startIndex === -1) return [];

    // Build the 9-planet circular sequence starting from parent planet
    const sequence: string[] = [];
    for (let i = 0; i < 9; i++) {
      sequence.push(PLANET_ORDER[(startIndex + i) % 9]);
    }

    const now = Date.now();
    let currentStart = start;
    const subPeriods: SubPeriod[] = [];

    sequence.forEach((planet) => {
      const years = PLANET_YEARS[planet] ?? 0;
      const durationMs = totalMs * (years / 120);
      const subStart = currentStart;
      const subEnd = currentStart + durationMs;

      subPeriods.push({
        planet,
        start_date: new Date(subStart).toISOString(),
        end_date: new Date(subEnd).toISOString(),
        is_current: now >= subStart && now < subEnd,
      });

      currentStart = subEnd;
    });

    // If none are current due to clock skew, set the closest one
    const hasCurrent = subPeriods.some(p => p.is_current);
    if (!hasCurrent && subPeriods.length > 0) {
      if (now < start) {
        subPeriods[0].is_current = true;
      } else {
        subPeriods[subPeriods.length - 1].is_current = true;
      }
    }

    return subPeriods;
  } catch {
    return [];
  }
}

/**
 * Formats an ISO date string into a user-friendly format: e.g. "14 Jul 1990"
 */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return dateStr; }
}

/**
 * Calculates human-readable duration between two dates in Years, Months, and Days
 */
export function getDurationLabel(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const remaining = totalDays - years * 365;
    const months = Math.floor(remaining / 30);
    const days = remaining - months * 30;
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'Yr' : 'Yrs'}`);
    if (months > 0) parts.push(`${months} Mo`);
    if (days > 0 && years === 0) parts.push(`${days} Days`);
    return parts.join(' ') || '< 1 Mo';
  } catch { return '—'; }
}

/**
 * Calculates absolute year duration rounded to nearest year
 */
export function getDurationYears(startDate: string, endDate: string): string {
  try {
    const totalDays = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const years = Math.round(totalDays / 365);
    return `${years} Yrs`;
  } catch { return '—'; }
}
