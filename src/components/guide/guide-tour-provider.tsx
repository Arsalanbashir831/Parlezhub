'use client';

import * as React from 'react';
import { driver } from 'driver.js';
import type { DriveStep } from 'driver.js';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  guideStorageKey,
  narrateOnly,
  type GuideRole,
  type GuideScope,
} from '@/constants/tour-steps';

interface GuideTourValue {
  start: () => void;
  scope: GuideScope;
}

const GuideTourContext = React.createContext<GuideTourValue | null>(null);

export function useGuideTour(): GuideTourValue {
  const context = React.useContext(GuideTourContext);
  if (!context) {
    throw new Error('useGuideTour must be used inside <GuideTourProvider>');
  }
  return context;
}

interface GuideTourProviderProps {
  scope: GuideScope;
  role: GuideRole;
  /** Built at start time so it reflects the current path, role and nav. */
  buildSteps: () => DriveStep[];
  /** Below this viewport width the sidebar is off-canvas, so anchors cannot be
   *  highlighted reliably and the tour falls back to narration cards. */
  desktopMinWidth?: number;
  /** Run before highlighting starts, e.g. expand a collapsed sidebar. */
  prepare?: () => void;
  /** Offer the tour automatically on a user's first visit of this scope. */
  autoPrompt?: boolean;
  promptTitle?: string;
  promptBody?: string;
  children: React.ReactNode;
}

const readFlag = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeFlag = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode — the tour still runs, it just re-prompts */
  }
};

export function GuideTourProvider({
  scope,
  role,
  buildSteps,
  desktopMinWidth = 1024,
  prepare,
  autoPrompt = true,
  promptTitle = 'New to Shakti Wheel?',
  promptBody = 'Take a one-minute tour of the sidebar and what each section is for.',
  children,
}: GuideTourProviderProps) {
  const storageKey = guideStorageKey(scope, role);
  const instanceRef = React.useRef<ReturnType<typeof driver> | null>(null);
  const [promptOpen, setPromptOpen] = React.useState(false);

  const buildRef = React.useRef(buildSteps);
  buildRef.current = buildSteps;

  const destroy = React.useCallback(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }
  }, []);

  const start = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    // The trigger can sit inside a highlighted region; do not restart mid-tour.
    if (instanceRef.current?.isActive()) return;

    prepare?.();
    setPromptOpen(false);

    // Let the sidebar expand (and its transition) settle before measuring.
    window.setTimeout(() => {
      const raw = buildRef.current();
      const desktop = window.innerWidth >= desktopMinWidth;
      const steps = desktop ? raw : narrateOnly(raw);
      if (steps.length === 0) return;

      destroy();

      const instance = driver({
        steps,
        showProgress: true,
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Finish tour',
        stagePadding: 10,
        stageRadius: 14,
        popoverOffset: 16,
        overlayColor: '#000000',
        overlayOpacity: 0.72,
        animate: true,
        allowClose: true,
        overlayClickBehavior: 'nextStep',
        // Role-conditional anchors may legitimately be absent.
        skipMissingElement: true,
        popoverClass: 'shakti-guide-popover',
        onDestroyed: (_element, _step, opts) => {
          writeFlag(storageKey, opts.reason === 'done' ? 'completed' : 'seen');
          instanceRef.current = null;
        },
      });

      instanceRef.current = instance;
      instance.drive();
    }, 350);
  }, [desktopMinWidth, destroy, prepare, storageKey]);

  React.useEffect(() => {
    if (!autoPrompt || readFlag(storageKey)) return;
    const timer = window.setTimeout(() => setPromptOpen(true), 2000);
    return () => window.clearTimeout(timer);
  }, [autoPrompt, storageKey]);

  React.useEffect(() => destroy, [destroy]);

  const value = React.useMemo<GuideTourValue>(
    () => ({ start, scope }),
    [start, scope],
  );

  return (
    <GuideTourContext.Provider value={value}>
      {children}
      {promptOpen && (
        <aside
          className="shakti-guide-prompt"
          aria-label="Guided tour offer"
        >
          <button
            type="button"
            className="shakti-guide-prompt-dismiss"
            aria-label="Dismiss guided tour offer"
            onClick={() => {
              writeFlag(storageKey, 'dismissed');
              setPromptOpen(false);
            }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="shakti-guide-prompt-title">{promptTitle}</p>
          <p className="shakti-guide-prompt-body">{promptBody}</p>
          <div className="shakti-guide-prompt-actions">
            <button type="button" className="shakti-guide-prompt-ghost" onClick={() => {
              writeFlag(storageKey, 'dismissed');
              setPromptOpen(false);
            }}>
              Maybe later
            </button>
            <button type="button" className="shakti-guide-prompt-primary" onClick={start}>
              Start tour
            </button>
          </div>
        </aside>
      )}
    </GuideTourContext.Provider>
  );
}

/** Footer button that re-opens the tour; place it inside the sidebar. */
export const GuideTourTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    anchor: string;
    label?: string;
    /** e.g. close the mobile navigation sheet before the tour starts. */
    onBeforeStart?: () => void;
  }
>(({ anchor, label = 'Guided tour', onBeforeStart, className, children, ...props }, ref) => {
  const { start } = useGuideTour();
  return (
    <button
      ref={ref}
      type="button"
      data-tour={anchor}
      onClick={() => {
        onBeforeStart?.();
        start();
      }}
      className={cn('shakti-guide-trigger', className)}
      {...props}
    >
      {children ?? label}
    </button>
  );
});

GuideTourTrigger.displayName = 'GuideTourTrigger';
