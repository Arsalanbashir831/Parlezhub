'use client';

import { BookOpenCheck, CalendarClock, Mic, Sparkles, Users } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { APPS } from '@/lib/apps';

const LEARNER_CARDS = [
  { icon: Mic, title: 'Talk with your AI tutor', body: 'Pick a language and a topic, then just start speaking.' },
  { icon: Users, title: 'Find a language consultant', body: 'Book a session with a human when you want feedback.' },
  { icon: BookOpenCheck, title: 'Review past sessions', body: 'Transcripts and corrections from every conversation.' },
];

const CONSULTANT_CARDS = [
  { icon: Sparkles, title: 'Publish a session', body: 'Describe what you teach, set a price and a length.' },
  { icon: CalendarClock, title: 'Set your availability', body: 'Choose the hours learners can book you.' },
  { icon: Users, title: 'Your learners', body: 'Chats and upcoming sessions with the people you teach.' },
];

/**
 * Parlezhub home. A placeholder until the tutor features land: it shows the
 * role-aware shape of the workspace so the shared auth, onboarding and role
 * plumbing can be exercised end to end.
 */
export default function ParlezhubHomePage() {
  const { activeRole } = useAuth();
  const { user } = useUser();
  const isConsultant = activeRole === 'TEACHER';
  const cards = isConsultant ? CONSULTANT_CARDS : LEARNER_CARDS;
  const roleLabel = APPS.parlezhub.roleLabels[isConsultant ? 'TEACHER' : 'STUDENT'];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
          {roleLabel}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          {user?.first_name ? `Welcome, ${user.first_name}!` : 'Welcome to ParlezHub!'}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-primary-foreground/85">
          {isConsultant
            ? 'Your consultant workspace is being built. Here is what will live here.'
            : 'Your AI language tutor is on its way. Here is what you will be able to do.'}
        </p>
      </section>

      <section aria-labelledby="coming-soon" className="space-y-3">
        <h2 id="coming-soon" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Coming soon
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-bold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
