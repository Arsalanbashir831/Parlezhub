'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { astrologyChatHref, astrologyHref } from '@/lib/astrology-navigation';
import ConversationPanel, { CHAT_CONTEXTS } from '@/components/agents/astrology/chat/conversation-panel';
import { useBirthProfile } from '@/hooks/useAstrology';

export default function AstrologyChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = studentId ? undefined : searchParams.get('guest_id') || undefined;
  const profile = useBirthProfile(studentId, guestId);
  const requestedCategory = searchParams.get('category');
  const category = CHAT_CONTEXTS.some(context => context.id === requestedCategory) ? requestedCategory! : 'divisional-charts';
  const name = profile.data?.guest_name || profile.data?.user_name || 'My chart';
  if (studentId) return <div className="obs-card p-8"><h1 className="obs-title">AI Vedic Astrologer</h1><p className="obs-muted mt-4">AI chat is available for your own and your guest profiles. Shared profiles remain read-only.</p></div>;
  if (profile.isLoading) return <p role="status" className="obs-card p-8">Loading chart context…</p>;
  if (profile.isError) return <div role="alert" className="obs-card p-8"><p>Could not load chart context.</p><button className="obs-control mt-4" onClick={() => profile.refetch()}>Retry</button></div>;
  if (!profile.data) return <div className="obs-card p-8"><h1 className="obs-title">Add birth details first</h1><p className="obs-muted mt-3">Your astrologer needs a birth profile for chart context.</p><Link className="obs-button mt-5" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILE, searchParams.toString())}>Add birth details</Link></div>;
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="obs-label mb-3">A conversation, with context</p><h1 className="obs-title flex items-center gap-3"><MessageCircle className="h-7 w-7 text-[var(--solar-gold)]" />AI Vedic Astrologer</h1></div>
      <label className="flex max-w-full flex-col gap-2 text-xs text-muted-foreground">Conversation topic<select value={category} onChange={event => router.push(astrologyChatHref(searchParams.toString(), event.target.value))} className="obs-control max-w-full">{CHAT_CONTEXTS.map(context => <option key={context.id} value={context.id}>{context.title}</option>)}</select></label>
    </header>
    <ConversationPanel key={`${category}:${guestId || 'me'}:${searchParams.get('question') || ''}`} category={category} guestId={guestId} name={name} question={searchParams.get('question') || ''} className="obs-card h-[70dvh] min-h-[420px] flex-none" />
  </div>;
}
