'use client';

import { AvailabilityEditor } from '@/components/settings/availability-editor';

/**
 * /astrology/service/settings — the astrologer's weekly availability. The
 * service layout already admits consultants only.
 */
export default function AstrologerSettingsPage() {
  return (
    <div className="flex min-w-0 flex-col gap-7">
      <header>
        <p className="obs-label mb-3">Astrologer Service</p>
        <h1 className="obs-title">Availability</h1>
        <p className="obs-muted mt-3 max-w-xl text-sm">
          Set the hours students can book a reading each week. You can add more than one time range per day.
        </p>
      </header>
      <AvailabilityEditor />
    </div>
  );
}
