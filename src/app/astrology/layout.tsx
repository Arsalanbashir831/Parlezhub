import type { Metadata } from 'next';

/**
 * Shakti Wheel (astrology) app root: everything under /astrology — its auth
 * pages, onboarding and the observatory (the (observatory) route group, which
 * adds the dashboard shell). The pitch-black ember theme is the base theme in
 * globals.css; `data-app` lets app-scoped CSS tell the apps apart.
 */
export const metadata: Metadata = {
  title: {
    default: 'Shakti Wheel — Vedic Astrology',
    template: '%s · Shakti Wheel',
  },
  description:
    'Birth charts, Vimshottari Dasha timelines, festival calendars and traditional interpretations from your own chart data',
};

export default function AstrologyAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-app="astrology" className="contents">
      {children}
    </div>
  );
}
