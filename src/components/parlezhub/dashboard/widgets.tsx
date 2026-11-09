'use client';

import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowRight, CalendarDays, Mic, PlusCircle, type LucideIcon } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { tutorLanguageLabel } from '@/constants/tutor';
import type { Meeting } from '@/hooks/useMeetings';
import { cn } from '@/lib/utils';
import type { VoiceConversationResponse } from '@/services/voice';
import type { Service } from '@/types/service';
import { buttonStyles, Panel, PanelTitle, SkeletonBlock } from '@/components/parlezhub/ui';

const viewAll = (href: string, label = 'View all') => (
  <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
    {label}
    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
  </Link>
);

/** The flow of the app in three steps, for somebody who has not started yet. */
export function FlowSteps({
  steps,
}: {
  steps: { icon: LucideIcon; title: string; body: string; href: string }[];
}) {
  return (
    <Panel aria-label="How it works" className="bg-gradient-to-br from-card to-secondary/70">
      <PanelTitle>How it works</PanelTitle>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body, href }, index) => (
          <li key={title}>
            <Link
              href={href}
              className="group flex h-full gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground group-hover:text-primary">{title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/** The soonest confirmed session, or what to do to get one. */
export function NextSessionCard({
  meetings,
  isLoading,
  isConsultant,
}: {
  meetings: Meeting[];
  isLoading: boolean;
  isConsultant: boolean;
}) {
  const now = Date.now();
  const next = meetings
    .filter((m) => m.status === 'CONFIRMED' && new Date(m.endDate ?? m.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const person = next ? (isConsultant ? next.studentName : next.consultantName) : undefined;

  return (
    <Panel>
      <PanelTitle action={viewAll(ROUTES.PARLEZHUB.MEETINGS)}>Next session</PanelTitle>
      {isLoading ? (
        <SkeletonBlock className="h-20" />
      ) : next ? (
        <div className="flex items-center gap-4 rounded-xl bg-secondary/70 p-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-card text-primary">
            <span className="text-[11px] font-bold uppercase">{format(new Date(next.date), 'MMM')}</span>
            <span className="text-xl font-extrabold leading-none">{format(new Date(next.date), 'd')}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">
              {person ? `With ${person}` : 'Language session'}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(next.date), 'EEEE, HH:mm')} · {next.duration} min
            </p>
            {next.paymentStatus !== 'PAID' && (
              <p className="mt-1 text-xs font-semibold text-amber-700">
                {isConsultant ? 'Waiting for payment' : 'Payment needed to join'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4">
          <CalendarDays className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {isConsultant
              ? 'No sessions booked yet. Learners book you from your gigs.'
              : 'No sessions booked. Find a consultant and book one from your chat.'}
          </p>
        </div>
      )}
    </Panel>
  );
}

export function RecentPractice({
  conversations,
  isLoading,
}: {
  conversations: VoiceConversationResponse[];
  isLoading: boolean;
}) {
  const recent = conversations.slice(0, 4);
  return (
    <Panel>
      <PanelTitle action={recent.length > 0 && viewAll(ROUTES.PARLEZHUB.HISTORY)}>
        Recent practice
      </PanelTitle>
      {isLoading ? (
        <div className="space-y-2">
          <SkeletonBlock className="h-14" />
          <SkeletonBlock className="h-14" />
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-5">
          <p className="text-sm text-muted-foreground">
            You haven’t practised yet. A five-minute conversation is a great start.
          </p>
          <Link href={ROUTES.PARLEZHUB.TUTOR} className={buttonStyles.secondary}>
            <Mic className="h-4 w-4" aria-hidden="true" />
            Start your first conversation
          </Link>
        </div>
      ) : (
        <ul className="-mx-2">
          {recent.map((conversation) => {
            const { flag, label } = tutorLanguageLabel(conversation.target_language);
            return (
              <li key={conversation.id}>
                <Link
                  href={`${ROUTES.PARLEZHUB.HISTORY}?id=${encodeURIComponent(conversation.id)}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg" aria-hidden="true">
                    {flag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {conversation.topic || 'Conversation'}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {label}
                      {conversation.duration_minutes ? ` · ${conversation.duration_minutes} min` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function GigsPreview({ gigs, isLoading }: { gigs: Service[]; isLoading: boolean }) {
  const shown = gigs.slice(0, 4);
  return (
    <Panel>
      <PanelTitle action={shown.length > 0 && viewAll(ROUTES.PARLEZHUB.GIGS)}>Your gigs</PanelTitle>
      {isLoading ? (
        <div className="space-y-2">
          <SkeletonBlock className="h-14" />
          <SkeletonBlock className="h-14" />
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-5">
          <p className="text-sm text-muted-foreground">
            A gig is what learners book: one session, with a price and a length.
          </p>
          <Link href={ROUTES.PARLEZHUB.CREATE_GIG} className={buttonStyles.secondary}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Create your first gig
          </Link>
        </div>
      ) : (
        <ul className="-mx-2">
          {shown.map((gig) => (
            <li key={gig.id}>
              <Link
                href={ROUTES.PARLEZHUB.EDIT_GIG(gig.id)}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary/60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{gig.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    ${gig.price} · {gig.duration} min
                  </span>
                </span>
                <StatusPill active={gig.status === 'active'} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary text-muted-foreground'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-muted-foreground')} aria-hidden="true" />
      {active ? 'Live' : 'Paused'}
    </span>
  );
}
