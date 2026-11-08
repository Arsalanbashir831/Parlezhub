'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { astrologyHref } from '@/lib/astrology-navigation';
import ConversationPanel from '@/components/astrology/chat/conversation-panel';
import ConversationRail from '@/components/astrology/chat/conversation-rail';
import { chatConversation } from '@/components/astrology/chat/chat-contexts';
import { EmptyNotice, LoadingLayout, RequestError, Skeleton, SkeletonText } from '@/components/astrology/ui/observatory-state';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useBirthProfile } from '@/hooks/useAstrology';

/** Ghost of the chat shell: conversation list on the right, thread and composer in the centre. */
function ChatSkeleton() {
  return <div className="obs-chat-shell grid-cols-1 xl:grid-cols-[minmax(0,1fr)_336px]">
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-6"><Skeleton className="h-8 w-52 max-w-full" rounded="rounded-lg" /></div>
      <LoadingLayout label="Loading chart context…" className="mx-auto w-full max-w-3xl flex-1 justify-center gap-7 px-4 py-6 sm:px-6">
        <Skeleton className="h-11 w-11" rounded="rounded-2xl" />
        <div className="space-y-3"><Skeleton className="h-7 w-96 max-w-full" rounded="rounded-lg" /><Skeleton className="h-3 w-72 max-w-full" rounded="rounded-md" /></div>
        <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2].map(index => <Skeleton key={index} className="h-20 w-full" rounded="rounded-2xl" />)}</div>
        <Skeleton className="h-20 w-full" rounded="rounded-2xl" />
      </LoadingLayout>
    </div>
    <aside className="hidden min-h-0 border-l border-border bg-[var(--cosmos-900)] p-4 xl:block" aria-hidden="true">
      <Skeleton className="h-3 w-28" rounded="rounded-md" />
      <Skeleton className="mt-4 h-10 w-full" rounded="rounded-xl" />
      <div className="mt-5 flex flex-col gap-3"><SkeletonText lines={1} /><SkeletonText lines={1} /><SkeletonText lines={1} /></div>
    </aside>
  </div>;
}

export default function AstrologyChatPage() {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const studentId = searchParams.get('student_id') || undefined;
  const guestId = studentId ? undefined : searchParams.get('guest_id') || undefined;
  const [railOpen, setRailOpen] = useState(false);
  const profile = useBirthProfile(studentId, guestId);
  const category = chatConversation(searchParams.get('category') ?? '')?.id ?? 'divisional-charts';
  const name = profile.data?.guest_name || profile.data?.user_name || 'My chart';

  if (studentId) return <div className="p-4 sm:p-6 lg:p-8"><div className="obs-card p-8"><h1 className="obs-title">AI Vedic Astrologer</h1><p className="obs-muted mt-4">AI chat is available for your own and your guest profiles. Shared profiles remain read-only.</p></div></div>;
  if (profile.isLoading) return <ChatSkeleton />;
  if (profile.isError) return <div className="p-4 sm:p-6 lg:p-8"><RequestError title="Could not load your chart context" message="Your birth details have not been changed. The astrologer needs them to answer from your chart, so the conversation stays closed until they load." onRetry={() => profile.refetch()} retrying={profile.isFetching}><Link className="obs-control mt-1 text-xs" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILES, search)}>Manage birth profiles</Link></RequestError></div>;
  if (!profile.data) return <div className="p-4 sm:p-6 lg:p-8"><EmptyNotice title="Add birth details first" message="Your astrologer answers from your birth chart, so it needs a recorded birth time and place." action={<Link className="obs-control obs-accent text-xs" href={astrologyHref(ROUTES.AGENT.ASTROLOGY.PROFILE, search)}>Add birth details</Link>} /></div>;

  const rail = <ConversationRail activeId={category} search={search} onNavigate={() => setRailOpen(false)} />;
  return <>
    <div className="obs-chat-shell grid-cols-1 xl:grid-cols-[minmax(0,1fr)_336px]">
      <ConversationPanel key={`${category}:${guestId || 'me'}`} category={category} guestId={guestId} name={name} question={searchParams.get('question') || ''} onOpenConversations={() => setRailOpen(true)} className="min-w-0" />
      <aside className="hidden min-h-0 border-l border-border bg-[var(--cosmos-900)] xl:block">{rail}</aside>
    </div>
    <Sheet open={railOpen} onOpenChange={setRailOpen}>
      <SheetContent side="right" className="observatory-theme flex w-[min(340px,90vw)] flex-col gap-0 border-border p-0">
        <SheetTitle className="sr-only">Conversations</SheetTitle>
        <SheetDescription className="sr-only">Pick a topic to open its conversation.</SheetDescription>
        <div className="min-h-0 flex-1">{rail}</div>
      </SheetContent>
    </Sheet>
  </>;
}
