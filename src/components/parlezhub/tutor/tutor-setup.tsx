'use client';

import { useEffect, useState } from 'react';
import { Check, GraduationCap } from 'lucide-react';

import { findTutorLanguage, TUTOR_LANGUAGES, TUTOR_LEVELS, type TutorLevel } from '@/constants/tutor';
import { TUTOR_MAX_CALL_SECONDS, type TutorConfig } from '@/lib/tutor';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buttonStyles, Panel } from '@/components/parlezhub/ui';

import { VoiceOrb } from './voice-orb';

const STORAGE_KEY = 'parlezhub:tutor-setup';

const DEFAULT_CONFIG: TutorConfig = {
  targetLanguage: 'es',
  nativeLanguage: 'en',
  level: 'beginner',
};

/** The last choices, so a returning learner starts in one tap. Best effort. */
function loadSaved(): TutorConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<TutorConfig>;
      // Only the fields a lesson has: older saves also carried a topic.
      return {
        targetLanguage: findTutorLanguage(saved.targetLanguage) ? saved.targetLanguage! : DEFAULT_CONFIG.targetLanguage,
        nativeLanguage: findTutorLanguage(saved.nativeLanguage) ? saved.nativeLanguage! : DEFAULT_CONFIG.nativeLanguage,
        level: TUTOR_LEVELS.some((option) => option.value === saved.level) ? saved.level! : DEFAULT_CONFIG.level,
      };
    }
  } catch {
    // Private mode or blocked storage: the defaults are fine.
  }
  return DEFAULT_CONFIG;
}

const STEPS = [
  'Your teacher explains everything in your language.',
  'New words and phrases come a few at a time.',
  'You repeat them out loud and get gentle corrections.',
  'Every lesson is saved to your history.',
];

export function TutorSetup({
  onStart,
  error,
}: {
  onStart: (config: TutorConfig) => void;
  /** Why the last lesson could not start, if it could not. */
  error?: string | null;
}) {
  const [config, setConfig] = useState<TutorConfig>(DEFAULT_CONFIG);

  useEffect(() => setConfig(loadSaved()), []);

  const update = (patch: Partial<TutorConfig>) => setConfig((current) => ({ ...current, ...patch }));
  const sameLanguage = config.targetLanguage === config.nativeLanguage;
  const nativeLabel = findTutorLanguage(config.nativeLanguage)?.label;

  const start = () => {
    if (sameLanguage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Not remembered this time; the lesson still starts.
    }
    onStart(config);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Panel className="space-y-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <LanguageField
            label="I want to learn"
            value={config.targetLanguage}
            onChange={(targetLanguage) => update({ targetLanguage })}
          />
          <LanguageField
            label="Teach me in"
            value={config.nativeLanguage}
            onChange={(nativeLanguage) => update({ nativeLanguage })}
          />
        </div>
        {sameLanguage && (
          <p role="alert" className="-mt-4 text-sm font-medium text-destructive">
            Pick a language to learn that differs from the one you are taught in.
          </p>
        )}

        <fieldset>
          <legend className="text-sm font-bold text-foreground">Your level</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {TUTOR_LEVELS.map((level) => {
              const selected = config.level === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update({ level: level.value as TutorLevel })}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-secondary/60'
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-bold text-foreground">
                    {level.label}
                    {selected && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{level.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <p className="rounded-xl bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
          Your teacher plans the lesson for your level and teaches it in {nativeLabel}. Want to learn something specific? Just ask during the lesson.
        </p>

        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={start}
            disabled={sameLanguage}
            className={buttonStyles.primary}
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Start lesson
          </button>
          <p className="text-xs text-muted-foreground">
            Uses your microphone · up to {TUTOR_MAX_CALL_SECONDS / 60} minutes · end it any time.
          </p>
        </div>
      </Panel>

      <aside className="ph-stage overflow-hidden rounded-2xl p-6">
        <div className="flex justify-center py-4">
          <VoiceOrb state="idle" className="w-28" />
        </div>
        <h2 className="mt-4 text-center text-sm font-bold">Your teacher is ready</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-white/70">
              <span className="ph-glass flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function LanguageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 rounded-xl bg-card" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72 rounded-xl">
          {TUTOR_LANGUAGES.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              <span className="mr-2" aria-hidden="true">
                {language.flag}
              </span>
              {language.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
