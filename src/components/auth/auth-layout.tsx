import type React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

import { Logo } from '@/components/ui/logo';
import CelestialBackground from '@/components/ui/celestial-background';
import ZodiacWheel from '@/components/ui/zodiac-wheel';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

// Navagraha planet badges orbiting the wheel (U+FE0E = monochrome presentation)
const PLANETS = [
  { glyph: '☉', name: 'Surya', className: 'left-[10%] top-[16%]' },
  { glyph: '☽', name: 'Chandra', className: 'right-[12%] top-[26%]' },
  { glyph: '♂', name: 'Mangala', className: 'left-[16%] bottom-[32%]' },
  { glyph: '♀', name: 'Shukra', className: 'right-[10%] bottom-[24%]' },
];

function PlanetBadge({
  glyph,
  name,
  className,
}: {
  glyph: string;
  name: string;
  className: string;
}) {
  return (
    <div
      aria-hidden
      className={`animate-float absolute flex items-center gap-2 ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ember/30 bg-black/60 text-base text-ember backdrop-blur-sm">
        {`${glyph}︎`}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        {name}
      </span>
    </div>
  );
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <CelestialBackground />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Left — cosmic showcase */}
        <div className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col">
          <div className="bg-dots mask-radial pointer-events-none absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-ember/10 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full bg-nebula/10 blur-[140px]" />

          <div className="relative flex flex-1 flex-col justify-between p-12 xl:p-16">
            <Logo size="md" />

            <div className="relative mx-auto my-10 w-full max-w-[min(480px,60vh)]">
              <ZodiacWheel className="w-full" />
              <PlanetBadge {...PLANETS[0]} />
              <PlanetBadge {...PLANETS[1]} />
              <PlanetBadge {...PLANETS[2]} />
              <PlanetBadge {...PLANETS[3]} />
            </div>

            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-ember">
                ✦ Vedic wisdom · AI guidance
              </p>
              <h2 className="text-4xl font-semibold leading-tight tracking-tighter text-white xl:text-5xl">
                Guided by the{' '}
                <span className="text-gradient-ember">Stars</span>,
                <br />
                in conversation.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
                Map your sky, meet your planets, and speak with guides who read
                the wheel the way it was meant to be read.
              </p>
            </div>
          </div>
        </div>

        {/* Right — form panel */}
        <div className="relative flex min-h-screen flex-col bg-background/80 p-6 backdrop-blur-xl md:p-12 lg:p-16">
          <Link
            href={ROUTES.LANDING_PAGE}
            className="mb-8 inline-flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-ember lg:mb-12"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full max-w-lg xl:max-w-xl">
              <div className="mb-8 text-center lg:mb-10">
                <h1 className="text-gradient text-3xl font-semibold tracking-tight md:text-4xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
                {children}
              </div>
            </div>
          </div>

          <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600 lg:mt-12">
            ✦ © {new Date().getFullYear()} Shakti Wheel ✦
          </p>
        </div>
      </div>
    </div>
  );
}
