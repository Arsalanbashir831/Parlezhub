import Image from 'next/image';

import { APPS } from '@/lib/apps';
import { ParlezhubLogo } from '@/components/parlezhub/brand/logo';

/** Learner quote, landmarks, language books and headphones (public/parlezhub). */
const SHOWCASE_IMAGE = '/parlezhub/auth-showcase.webp';

/**
 * ParlezHub's frame for every auth and onboarding screen: one rounded card on
 * a lavender canvas, the form on the left and the showcase illustration on the
 * right. Phones get the form alone, edge to edge.
 */
export function ParlezhubAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-stretch justify-center bg-background sm:items-center sm:p-6 lg:p-10">
      <div className="grid w-full max-w-6xl overflow-hidden bg-card sm:rounded-[2.25rem] sm:border sm:border-white sm:shadow-[0_40px_80px_-40px_hsl(var(--primary)/0.45)] lg:min-h-[min(860px,calc(100vh-5rem))] lg:grid-cols-2">
        <main className="relative isolate flex flex-col px-6 pb-10 pt-8 sm:px-12 sm:pt-12">
          {/* Soft corner shape, as in the brand artwork. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-28 -z-10 h-64 w-64 rounded-full bg-secondary"
          />
          <ParlezhubLogo href={APPS.parlezhub.home} />

          <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col justify-center pt-10">
            <header className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mx-auto mt-3 max-w-[22rem] text-base text-muted-foreground sm:text-lg">
                  {subtitle}
                </p>
              )}
            </header>
            <div className="mt-8">{children}</div>
          </div>
        </main>

        {/* The artwork carries a ~420px lavender run-off below the scene, so
            it fills the pane width and anchors at the top: a taller form
            (sign-up) reveals more run-off, never a crop of the scene or a seam.
            The fill matches the run-off for the rare pane taller still. */}
        <aside className="relative hidden bg-[#e2d1fc] lg:block">
          <Image
            src={SHOWCASE_IMAGE}
            alt="“ParlezHub has made learning new languages so easy and fun!” — a learner, beside world landmarks, language books and headphones"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover object-top"
          />
        </aside>
      </div>
    </div>
  );
}
