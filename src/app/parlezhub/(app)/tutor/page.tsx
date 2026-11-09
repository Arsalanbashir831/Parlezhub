'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, History, MessageSquareText, RotateCcw, Type } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useVapiTutor, type TutorSummary } from '@/hooks/useVapiTutor';
import { buttonStyles, PageHeader, Panel } from '@/components/parlezhub/ui';
import { TutorSession } from '@/components/parlezhub/tutor/tutor-session';
import { TutorSetup } from '@/components/parlezhub/tutor/tutor-setup';

/** /parlezhub/tutor — a voice practice call with the AI language tutor (Vapi). */
export default function TutorPage() {
  const tutor = useVapiTutor();

  // A live call ends if the tab closes; say so first.
  const inCall = tutor.status === 'active';
  useEffect(() => {
    if (!inCall) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [inCall]);

  if (tutor.status === 'setup' || !tutor.config) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="AI Language Tutor"
          title="Learn with your AI teacher"
          description="Pick the language you want to learn and your level. Your teacher explains everything in your own language and has you speaking from the first minute."
        />
        <TutorSetup onStart={(config) => void tutor.start(config)} error={tutor.error} />
      </div>
    );
  }

  if (tutor.status === 'ended' && tutor.summary) {
    return <SessionSummary summary={tutor.summary} onAgain={tutor.reset} />;
  }

  return (
    <TutorSession
      config={tutor.config}
      status={tutor.status}
      messages={tutor.messages}
      interim={tutor.interim}
      levelsRef={tutor.levelsRef}
      isTutorSpeaking={tutor.isTutorSpeaking}
      isMicMuted={tutor.isMicMuted}
      isTutorMuted={tutor.isTutorMuted}
      error={tutor.error}
      onSendText={tutor.sendText}
      onToggleMic={tutor.toggleMic}
      onToggleTutorVoice={tutor.toggleTutorVoice}
      onEnd={tutor.end}
    />
  );
}

function SessionSummary({ summary, onAgain }: { summary: TutorSummary; onAgain: () => void }) {
  const saidNothing = summary.turns === 0;
  const stats = [
    { icon: Clock, label: 'Minutes', value: summary.minutes },
    { icon: MessageSquareText, label: 'Your turns', value: summary.turns },
    { icon: Type, label: 'Words spoken', value: summary.words },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <Panel className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
          {saidNothing ? 'Call ended' : 'Nice work!'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {saidNothing
            ? 'You didn’t speak this time, so nothing was saved.'
            : summary.saved
              ? 'This lesson is saved in your history with its full transcript.'
              : summary.saveError}
        </p>

        {!saidNothing && (
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-secondary/70 px-3 py-4">
                <Icon className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
                <dd className="mt-1 text-xl font-extrabold text-foreground">{value}</dd>
                <dt className="text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onAgain} className={buttonStyles.primary}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Start another lesson
          </button>
          {summary.saved && (
            <Link
              // The save may not echo the new id; then History opens on its list.
              href={
                summary.saved.id != null
                  ? `${ROUTES.PARLEZHUB.HISTORY}?id=${encodeURIComponent(String(summary.saved.id))}`
                  : ROUTES.PARLEZHUB.HISTORY
              }
              className={buttonStyles.secondary}
            >
              <History className="h-4 w-4" aria-hidden="true" />
              Review transcript
            </Link>
          )}
        </div>
      </Panel>
    </div>
  );
}
