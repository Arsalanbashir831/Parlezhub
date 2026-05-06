'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import InsightView from '@/components/agents/astrology/analysis/insight-view';
import { ROUTES } from '@/constants/routes';

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
        onBack={() => router.push(`${ROUTES.AGENT.ASTROLOGY.D1}?${searchParams.toString()}`)}
        studentId={studentId}
        guestProfileId={guestId}
      />
    </div>
  );
}
