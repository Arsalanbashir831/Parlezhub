'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import BirthProfileForm from '@/components/agents/astrology/components/birth-profile-form';
import { ROUTES } from '@/constants/routes';

export default function BirthProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = searchParams.get('guest_id') || undefined;

  const isReadOnly = !!studentId;

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <BirthProfileForm
        type={guestId ? 'guest' : studentId ? 'student' : 'me'}
        readOnly={isReadOnly}
        studentId={studentId}
        guestProfileId={guestId}
        onSuccess={() => {
          // After saving, go back to D1 chart
          router.push(`${ROUTES.AGENT.ASTROLOGY.D1}?${searchParams.toString()}`);
        }}
      />
    </div>
  );
}
