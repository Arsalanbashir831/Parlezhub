import Link from 'next/link';

import { cn } from '@/lib/utils';

/** ParlezHub mark: a violet speech bubble carrying a voice wave. */
function ParlezhubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="ph-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary-deep))" />
        </linearGradient>
      </defs>
      {/* Round bubble with a tail at the lower left. */}
      <path
        d="M24 3C12.4 3 3 11.6 3 22.2c0 4.7 1.8 9 4.9 12.3L6.4 44a1 1 0 0 0 1.4 1.1l9-4.1c2.2.7 4.7 1.1 7.2 1.1 11.6 0 21-8.6 21-19.2S35.6 3 24 3Z"
        fill="url(#ph-mark)"
      />
      {/* Voice wave. */}
      <g fill="#fff">
        <rect x="13.5" y="17" width="4.5" height="11" rx="2.25" />
        <rect x="21.75" y="12.5" width="4.5" height="20" rx="2.25" />
        <rect x="30" y="17" width="4.5" height="11" rx="2.25" />
      </g>
    </svg>
  );
}

export function ParlezhubLogo({
  href,
  compact = false,
  className,
}: {
  href?: string;
  /** Mark only, for tight headers. */
  compact?: boolean;
  className?: string;
}) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <ParlezhubMark className="h-10 w-10 shrink-0" />
      {!compact && (
        <span className="text-2xl font-extrabold tracking-tight text-foreground">
          Parlez<span className="text-primary">Hub</span>
        </span>
      )}
    </span>
  );

  return href ? (
    <Link href={href} aria-label="ParlezHub home" className="inline-flex">
      {content}
    </Link>
  ) : (
    content
  );
}
