'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

import ShareAccessView from '@/components/agents/astrology/analysis/share-access-view';

export default function ShareAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  // Sharing access is restricted to personal charts
  if (studentId || guestId) {
    return (
      <section className="obs-card space-y-3 p-6 text-foreground">
        <h1 className="text-xl font-semibold">Personal charts only</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          You can manage sharing for your own personal birth profile, not a
          guest profile or another student’s chart. Switch to your personal
          profile to manage access.
        </p>
      </section>
    );
  }

  return (
    <div className="w-full min-w-0">
      <ShareAccessView
        onBack={() =>
          router.push(
            `${ROUTES.AGENT.ASTROLOGY.ROOT}?${searchParams.toString()}`
          )
        }
      />
    </div>
  );
}
