'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import InsightView from '@/components/agents/astrology/analysis/insight-view';
import { ROUTES } from '@/constants/routes';
import { astrologyHref } from '@/lib/astrology-navigation';

export default function InsightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  const slug = params.slug as string;

  return (
    <div className="flex h-full w-full flex-col">
      <InsightView
        slug={slug}
        onBack={() => router.push(astrologyHref(ROUTES.AGENT.ASTROLOGY.ANALYSIS, searchParams.toString()))}
        studentId={studentId}
        guestProfileId={guestId}
      />
    </div>
  );
}
