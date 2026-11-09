'use client';

import { MapPin } from 'lucide-react';

import type { ConsultantProfile } from '@/lib/astrologer-directory';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ConsultantAvatar({
  profile,
  size = 'md',
}: {
  profile: ConsultantProfile;
  size?: 'md' | 'lg';
}) {
  const initials =
    profile.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?';
  return (
    <Avatar className={cn('shrink-0', size === 'lg' ? 'h-16 w-16' : 'h-12 w-12')}>
      <AvatarImage src={profile.avatar || undefined} alt="" className="object-cover" />
      <AvatarFallback className="bg-secondary font-bold text-primary">{initials}</AvatarFallback>
    </Avatar>
  );
}

/** A consultant in the directory: who, what they teach, and from what price. */
export function ConsultantCard({
  profile,
  onSelect,
}: {
  profile: ConsultantProfile;
  onSelect: (profile: ConsultantProfile) => void;
}) {
  const sessions = profile.services.length;
  return (
    <button
      type="button"
      onClick={() => onSelect(profile)}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      <div className="flex items-center gap-3">
        <ConsultantAvatar profile={profile} />
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground group-hover:text-primary">{profile.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {profile.qualification || 'Language consultant'}
          </p>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
      )}

      {profile.specialties.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {profile.specialties.slice(0, 3).map((tag) => (
            <li key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <span className="text-xs text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.location}
            </span>
          )}
          {sessions} {sessions === 1 ? 'session' : 'sessions'}
        </span>
        <span className="text-right">
          <span className="block text-[11px] text-muted-foreground">from</span>
          <span className="text-lg font-extrabold text-foreground">${profile.startingPrice}</span>
        </span>
      </div>
    </button>
  );
}
