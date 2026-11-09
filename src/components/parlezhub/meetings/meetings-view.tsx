'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, CalendarX2, Check, Search, Video } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useMeetingsView } from '@/contexts/meetings-context';
import type { Meeting } from '@/hooks/useMeetings';
import { cn } from '@/lib/utils';
import CancelMeetingDialog from '@/components/meetings/cancel-meeting-dialog';
import MeetingPaymentButton from '@/components/meetings/meeting-payment-button';
import RescheduleDialog from '@/components/meetings/reschedule-meeting-dialog';
import { buttonStyles, EmptyState, ErrorState, SkeletonBlock } from '@/components/parlezhub/ui';

type Tab = 'upcoming' | 'pending' | 'pendingPayment' | 'completed' | 'cancelled';

/** Joining opens 5 minutes before the start and closes 5 minutes after the end. */
const JOIN_MARGIN_MS = 5 * 60_000;

const startMs = (m: Meeting) => new Date(m.date).getTime();
const endMs = (m: Meeting) => (m.endDate ? new Date(m.endDate).getTime() : startMs(m) + m.duration * 60_000);

export function MeetingsView() {
  const {
    meetings,
    filteredMeetings,
    counts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    refresh,
    userRole,
    approveBooking,
    cancelBooking,
    rescheduleBooking,
    isProcessing,
  } = useMeetingsView();
  const isConsultant = userRole === 'teacher';
  const [cancelling, setCancelling] = useState<Meeting | null>(null);
  const [rescheduling, setRescheduling] = useState<Meeting | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Keep the join buttons honest without a reload.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'pending', label: isConsultant ? 'Requests' : 'Awaiting approval', count: counts.pending },
    { id: 'pendingPayment', label: isConsultant ? 'Awaiting payment' : 'To pay', count: counts.pendingPayment },
    { id: 'completed', label: 'Past', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const join = (meeting: Meeting) => {
    const link = isConsultant
      ? meeting.hostLink ?? meeting.meetingLink
      : meeting.joinLink ?? meeting.meetingLink;
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (isError && meetings.length === 0) {
    return <ErrorState title="Meetings could not be loaded" body="Check your connection and try again." onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div role="tablist" aria-label="Meetings" className="inline-flex gap-1 rounded-full border border-border bg-card p-1">
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors',
                    selected ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={cn('rounded-full px-1.5 text-xs', selected ? 'bg-primary-foreground/20' : 'bg-secondary text-foreground')}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <label className="relative min-w-0 lg:ml-auto lg:w-64">
          <span className="sr-only">Search meetings</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name"
            className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          />
        </label>
      </div>

      <div role="tabpanel" className="space-y-3">
        {isLoading ? (
          <>
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </>
        ) : filteredMeetings.length === 0 ? (
          <EmptyState
            icon={activeTab === 'cancelled' ? CalendarX2 : CalendarDays}
            title={searchQuery ? 'No meeting matches that search' : emptyTitle(activeTab)}
            body={searchQuery ? undefined : emptyBody(activeTab, isConsultant)}
            action={
              !searchQuery && activeTab === 'upcoming' ? (
                <Link
                  href={isConsultant ? ROUTES.PARLEZHUB.GIGS : ROUTES.PARLEZHUB.CONSULTANTS}
                  className={buttonStyles.secondary}
                >
                  {isConsultant ? 'View my gigs' : 'Find a consultant'}
                </Link>
              ) : undefined
            }
          />
        ) : (
          filteredMeetings.map((meeting) => {
            const isPast = activeTab === 'completed';
            const isFuture = startMs(meeting) > now;
            const canJoin = now >= startMs(meeting) - JOIN_MARGIN_MS && now <= endMs(meeting) + JOIN_MARGIN_MS;
            const person = isConsultant ? meeting.studentName : meeting.consultantName;
            const actionable =
              !isPast && ((meeting.status === 'PENDING' && isFuture) || meeting.status === 'CONFIRMED');

            return (
              <article key={meeting.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-primary">
                    <span className="text-[11px] font-bold uppercase">{format(new Date(meeting.date), 'MMM')}</span>
                    <span className="text-xl font-extrabold leading-none">{format(new Date(meeting.date), 'd')}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">
                      {person ? `With ${person}` : 'Language session'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(meeting.date), 'EEE, HH:mm')} · {meeting.duration} min
                      {meeting.paymentDetails?.totalAmount != null &&
                        ` · $${meeting.paymentDetails.totalAmount.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {actionable && (
                  <div className="flex flex-wrap items-center gap-2">
                    {isConsultant && meeting.status === 'PENDING' && (
                      <button type="button" disabled={isProcessing} onClick={() => approveBooking(meeting.id)} className={buttonStyles.primary + ' h-10'}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Approve
                      </button>
                    )}
                    {!isConsultant && <MeetingPaymentButton meeting={meeting} />}
                    {meeting.status === 'CONFIRMED' && meeting.paymentStatus === 'PAID' && (
                      <>
                        <button
                          type="button"
                          onClick={() => join(meeting)}
                          disabled={!canJoin}
                          title={canJoin ? 'Join this session' : 'Opens 5 minutes before the start'}
                          className={buttonStyles.primary + ' h-10'}
                        >
                          <Video className="h-4 w-4" aria-hidden="true" />
                          Join
                        </button>
                        {!isConsultant && isFuture && (
                          <button type="button" onClick={() => setRescheduling(meeting)} className={buttonStyles.secondary + ' h-10'}>
                            Reschedule
                          </button>
                        )}
                      </>
                    )}
                    <button type="button" onClick={() => setCancelling(meeting)} className={buttonStyles.ghost + ' h-10 text-destructive hover:text-destructive'}>
                      Cancel
                    </button>
                  </div>
                )}
                {!actionable && <StatusLabel meeting={meeting} tab={activeTab} />}
              </article>
            );
          })
        )}
      </div>

      <CancelMeetingDialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && setCancelling(null)}
        meeting={cancelling}
        activeTab={activeTab}
        isSubmitting={isProcessing}
        onConfirm={(reason, refund) => {
          if (cancelling) cancelBooking(cancelling.id, reason, refund, cancelling);
          setCancelling(null);
        }}
      />
      <RescheduleDialog
        open={Boolean(rescheduling)}
        onOpenChange={(open) => !open && setRescheduling(null)}
        meetingTitle={rescheduling?.consultantName ? `Session with ${rescheduling.consultantName}` : 'Session'}
        isSubmitting={isProcessing}
        onConfirm={async (start, end, reason) => {
          if (rescheduling) rescheduleBooking(rescheduling.id, { start_time: start, end_time: end, reason });
          setRescheduling(null);
        }}
      />
    </div>
  );
}

function StatusLabel({ meeting, tab }: { meeting: Meeting; tab: Tab }) {
  const label =
    meeting.status === 'CANCELLED' ? 'Cancelled' : tab === 'completed' ? 'Completed' : meeting.status === 'PENDING' ? 'Expired request' : null;
  if (!label) return null;
  return (
    <span className="self-start rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground sm:self-center">
      {label}
    </span>
  );
}

function emptyTitle(tab: Tab) {
  return {
    upcoming: 'No upcoming sessions',
    pending: 'Nothing waiting for approval',
    pendingPayment: 'Nothing to pay',
    completed: 'No past sessions yet',
    cancelled: 'No cancelled sessions',
  }[tab];
}

function emptyBody(tab: Tab, isConsultant: boolean) {
  if (tab === 'upcoming')
    return isConsultant
      ? 'Confirmed, paid sessions with your learners will appear here.'
      : 'Message a consultant and book a session from the chat. Once it is approved and paid, it shows up here.';
  if (tab === 'pending')
    return isConsultant ? 'New booking requests from learners land here for you to approve.' : 'Bookings you request appear here until the consultant approves them.';
  if (tab === 'pendingPayment')
    return isConsultant ? 'Approved sessions the learner has not paid for yet.' : 'Approved sessions you still need to pay for.';
  return undefined;
}
