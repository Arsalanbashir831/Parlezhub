'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BirthProfileForm from '@/components/agents/astrology/components/birth-profile-form';
import { useBirthProfile } from '@/hooks/useAstrology';
import { ROUTES } from '@/constants/routes';
import { astrologyHref } from '@/lib/astrology-navigation';

export default function BirthProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = studentId ? undefined : searchParams.get('guest_id') || undefined;
  const { data: profile } = useBirthProfile(studentId, guestId);
  return <div className="space-y-6">
    <header><p className="obs-label mb-3">Your chart begins here</p><h1 className="obs-title">{studentId ? 'View birth details' : 'Birth details'}</h1><p className="obs-muted mt-3 max-w-2xl text-sm">{studentId ? 'This shared profile is read-only. Only the owner can change birth details.' : 'Use the recorded local birth time and birthplace. Accurate details are important for chart calculations.'}</p></header>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <BirthProfileForm type={guestId ? 'guest' : studentId ? 'student' : 'me'} readOnly={!!studentId} studentId={studentId} guestProfileId={guestId} onSuccess={() => router.push(astrologyHref(ROUTES.AGENT.ASTROLOGY.ROOT, searchParams.toString()))} />
      <aside className="obs-card p-6"><h2 className="text-base font-medium">A note on birth time</h2><p className="obs-muted mt-3 text-sm leading-relaxed">Small time differences can affect the ascendant and divisional charts. If the recorded time is uncertain, interpret those details cautiously.</p><p className="mt-4 text-sm text-muted-foreground">{profile?.timezone_str ? `Resolved birth timezone: ${profile.timezone_str}` : 'The calculation service resolves the birth timezone from your location.'}</p><Link className="obs-control mt-5" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILES, searchParams.toString())}>Manage birth profiles</Link></aside>
    </div>
  </div>;
}
