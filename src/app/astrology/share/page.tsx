'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import ShareAccessView from '@/components/agents/astrology/analysis/share-access-view';
import { ROUTES } from '@/constants/routes';

export default function ShareAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  // Sharing access is restricted to personal charts
  if (studentId || guestId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="font-serif text-lg text-slate-500">
          Sharing access is restricted to personal charts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <ShareAccessView onBack={() => router.push(`${ROUTES.AGENT.ASTROLOGY.D1}?${searchParams.toString()}`)} />
    </div>
  );
}
