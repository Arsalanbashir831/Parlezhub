'use client';

import { useEffect, useRef, type RefObject } from 'react';

import type { AudioLevels } from '@/hooks/useVapiTutor';
import { cn } from '@/lib/utils';

export type OrbState = 'connecting' | 'idle' | 'tutor' | 'learner' | 'muted';

/** How far the learner's voice turns the orb from violet towards blue.
 *  Further than ~-30° and its cyan edge turns green. */
const LEARNER_HUE = -25;

/**
 * The tutor's presence: a gradient sphere that swells with whoever is
 * speaking. Audio levels are read from a ref every animation frame and written
 * straight to CSS variables, so a call never re-renders the page 60 times a
 * second. With reduced motion it holds still.
 */
export function VoiceOrb({
  state,
  levelsRef,
  className,
}: {
  state: OrbState;
  levelsRef?: RefObject<AudioLevels>;
  className?: string;
}) {
  const orbRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let level = 0;
    let hue = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const current = stateRef.current;
      const levels = levelsRef?.current ?? { tutor: 0, learner: 0 };
      const target =
        current === 'tutor' ? levels.tutor : current === 'learner' ? levels.learner : 0;
      // Rise fast, fall slowly: speech looks lively, silence looks calm.
      level += (Math.min(1, target * 1.6) - level) * (target > level ? 0.35 : 0.08);
      hue += ((current === 'learner' ? LEARNER_HUE : 0) - hue) * 0.06;

      // A slow breath underneath, so the orb is never dead still.
      const breath = Math.sin((now - start) / 1400) * 0.025;
      orb.style.setProperty('--orb-scale', (1 + breath + level * 0.22).toFixed(3));
      orb.style.setProperty('--orb-glow', (0.3 + level * 0.7).toFixed(3));
      orb.style.setProperty('--orb-hue', `${hue.toFixed(1)}deg`);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [levelsRef]);

  return (
    <div
      ref={orbRef}
      data-state={state === 'tutor' || state === 'learner' ? 'live' : state}
      className={cn('ph-orb', className)}
      aria-hidden="true"
    >
      <div className="ph-orb__glow" />
      <div className="ph-orb__core">
        <div className="ph-orb__swirl ph-orb__swirl--a" />
        <div className="ph-orb__swirl ph-orb__swirl--b" />
        <div className="ph-orb__shine" />
      </div>
    </div>
  );
}
