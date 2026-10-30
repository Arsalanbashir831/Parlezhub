'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { NavataraEducationView } from '@/components/agents/astrology/components/navatara-education-view';
import { ROUTES } from '@/constants/routes';
import { astrologyHref } from '@/lib/astrology-navigation';

export default function NavataraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  return (
    <div className="flex w-full min-w-0 flex-col">
      <NavataraEducationView
        studentId={studentId}
        guestProfileId={guestId}
        onClose={() => router.push(astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, searchParams.toString()))}
      />
    </div>
  );
}
