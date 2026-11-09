'use client';

import Link from 'next/link';
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Handshake,
  Inbox,
  LayoutList,
  MessageCircle,
  Mic,
  PlusCircle,
  Users,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { useMeetings } from '@/hooks/useMeetings';
import { useServices } from '@/hooks/useServices';
import { useVoiceConversations } from '@/hooks/useVoiceConversations';
import { APPS } from '@/lib/apps';
import { ActionTile, buttonStyles, PageHeader, StatCard } from '@/components/parlezhub/ui';
import {
  FlowSteps,
  GigsPreview,
  NextSessionCard,
  RecentPractice,
} from '@/components/parlezhub/dashboard/widgets';

const P = ROUTES.PARLEZHUB;

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

/** /parlezhub — the home of either profile: where things stand, what's next. */
export default function ParlezhubDashboardPage() {
  const { activeRole } = useAuth();
  const isConsultant = activeRole === 'TEACHER';
  return isConsultant ? <ConsultantDashboard /> : <LearnerDashboard />;
}

function useGreetingTitle() {
  const { user } = useUser();
  return user?.first_name ? `${greeting()}, ${user.first_name}` : greeting();
}

function LearnerDashboard() {
  const title = useGreetingTitle();
  const practice = useVoiceConversations();
  const meetings = useMeetings();
  const isNew =
    !practice.isLoading &&
    !meetings.isLoading &&
    practice.conversations.length === 0 &&
    meetings.meetings.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={APPS.parlezhub.roleLabels.STUDENT}
        title={title}
        description="Practise speaking with your AI tutor, then book a language consultant when you want a human touch."
        actions={
          <Link href={P.TUTOR} className={buttonStyles.primary}>
            <Mic className="h-4 w-4" aria-hidden="true" />
            Start practising
          </Link>
        }
      />

      {isNew && (
        <FlowSteps
          steps={[
            { icon: Mic, title: 'Practise with the AI tutor', body: 'Pick a language and a topic, then just talk.', href: P.TUTOR },
            { icon: Users, title: 'Find a language consultant', body: 'Browse consultants and message the one you like.', href: P.CONSULTANTS },
            { icon: CalendarCheck, title: 'Book and meet', body: 'Book a session from the chat and join it from Meetings.', href: P.MEETINGS },
          ]}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Mic} label="Practice sessions" value={practice.totals.count} isLoading={practice.isLoading} />
        <StatCard icon={Clock} label="Minutes practised" value={practice.totals.minutes} isLoading={practice.isLoading} />
        <StatCard
          icon={CalendarDays}
          label="Upcoming sessions"
          value={meetings.counts.upcoming + meetings.counts.pendingPayment}
          hint={meetings.counts.pending ? `${meetings.counts.pending} waiting for approval` : undefined}
          isLoading={meetings.isLoading}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <RecentPractice conversations={practice.conversations} isLoading={practice.isLoading} />
        <div className="space-y-6">
          <NextSessionCard meetings={meetings.meetings} isLoading={meetings.isLoading} isConsultant={false} />
          <div className="grid gap-3">
            <ActionTile href={P.CONSULTANTS} icon={Users} title="Find a consultant" body="Browse language consultants." />
            <ActionTile href={P.CHAT} icon={MessageCircle} title="Messages" body="Talk to your consultants." />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsultantDashboard() {
  const title = useGreetingTitle();
  const { services, stats, isLoading: gigsLoading } = useServices({ category: 'language' });
  const meetings = useMeetings();
  const isNew = !gigsLoading && services.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={APPS.parlezhub.roleLabels.TEACHER}
        title={title}
        description="Your gigs, your bookings and your learners, in one place."
        actions={
          <Link href={P.CREATE_GIG} className={buttonStyles.primary}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Create a gig
          </Link>
        }
      />

      {isNew && (
        <FlowSteps
          steps={[
            { icon: PlusCircle, title: 'Create a gig', body: 'Describe a session, set its price and length.', href: P.CREATE_GIG },
            { icon: MessageCircle, title: 'Learners message you', body: 'They find your gig and start a chat.', href: P.CHAT },
            { icon: Handshake, title: 'Approve and meet', body: 'Accept bookings and join from Meetings.', href: P.MEETINGS },
          ]}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={LayoutList}
          label="Live gigs"
          value={stats.activeServices}
          hint={stats.totalServices > stats.activeServices ? `${stats.totalServices - stats.activeServices} paused` : undefined}
          isLoading={gigsLoading}
        />
        <StatCard icon={Inbox} label="Requests to approve" value={meetings.counts.pending} isLoading={meetings.isLoading} />
        <StatCard
          icon={CalendarDays}
          label="Upcoming sessions"
          value={meetings.counts.upcoming + meetings.counts.pendingPayment}
          isLoading={meetings.isLoading}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <GigsPreview gigs={services} isLoading={gigsLoading} />
        <div className="space-y-6">
          <NextSessionCard meetings={meetings.meetings} isLoading={meetings.isLoading} isConsultant />
          <div className="grid gap-3">
            <ActionTile href={P.MEETINGS} icon={CalendarCheck} title="Meetings" body="Approve requests and join sessions." />
            <ActionTile href={P.CHAT} icon={MessageCircle} title="Messages" body="Reply to your learners." />
          </div>
        </div>
      </div>
    </div>
  );
}
