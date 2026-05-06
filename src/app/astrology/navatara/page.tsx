'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { NavataraEducationView } from '@/components/agents/astrology/components/navatara-education-view';
import { ROUTES } from '@/constants/routes';

export default function NavataraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  return (
    <div className="flex w-full flex-col p-4 duration-500 animate-in fade-in md:p-8">
      <NavataraEducationView
        studentId={studentId}
        guestProfileId={guestId}
        onClose={() => router.push(`${ROUTES.AGENT.ASTROLOGY.D1}?${searchParams.toString()}`)}
      />
    </div>
  );
}
