'use client';

import { ArrowUpRight, Clock3, MapPin, Sparkles } from 'lucide-react';

import type { AstrologerProfile } from '@/lib/astrologer-directory';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AstrologerProfileCardProps {
  profile: AstrologerProfile;
  priceRange: [number, number];
  onSelect: (profile: AstrologerProfile) => void;
}

export function AstrologerProfileCard({
  profile,
  priceRange,
  onSelect,
}: AstrologerProfileCardProps) {
  const initials = profile.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const matchingPrice = Math.min(
    ...profile.services
      .filter((service) => service.price >= priceRange[0] && service.price <= priceRange[1])
      .map((service) => service.price)
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(profile)}
      aria-label={`View ${profile.name}'s profile and services`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#10100f] text-left shadow-[0_18px_50px_-35px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-1 hover:border-ember/45 hover:shadow-[0_24px_60px_-35px_rgba(255,163,90,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-4 focus-visible:ring-offset-black motion-reduce:transform-none"
    >
      <div className="relative w-full overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_85%_0%,rgba(255,163,90,0.17),transparent_55%),linear-gradient(145deg,#1d1a17,#111110)] px-6 pb-6 pt-7">
        <div className="absolute right-6 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition group-hover:border-ember/40 group-hover:bg-ember group-hover:text-black">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ember">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Astrologer
        </div>
        <div className="flex items-end gap-4">
          <Avatar className="h-[4.5rem] w-[4.5rem] border-2 border-ember/35 bg-[#34251a] shadow-lg shadow-black/30">
            <AvatarImage
              src={profile.avatar || undefined}
              alt=""
              className="object-cover"
            />
            <AvatarFallback className="bg-[#35291e] text-xl font-semibold text-ember-soft">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 pb-0.5">
            <h2 className="truncate font-serif text-[1.45rem] font-semibold leading-tight tracking-tight text-white">
              {profile.name}
            </h2>
            <p className="mt-1 line-clamp-1 text-sm text-white/60">
              {profile.qualification || 'Astrology consultant'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-5 p-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
          {profile.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin
                className="h-3.5 w-3.5 text-ember/70"
                aria-hidden="true"
              />
              {profile.location}
            </span>
          )}
          {profile.experience > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3
                className="h-3.5 w-3.5 text-ember/70"
                aria-hidden="true"
              />
              {profile.experience} years experience
            </span>
          )}
        </div>
        <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-white/70">
          {profile.bio ||
            profile.services[0]?.shortDescription ||
            'Explore this astrologer’s consultations and find the right session for you.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {(profile.specialties.length
            ? profile.specialties
            : profile.services.map((service) => service.title)
          )
            .slice(0, 3)
            .map((specialty) => (
              <span
                key={specialty}
                className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70"
              >
                {specialty}
              </span>
            ))}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs text-white/45">Starting at</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-white">
              ${Number.isFinite(matchingPrice) ? matchingPrice : profile.startingPrice}
              <span className="ml-1 text-xs font-normal text-white/50">
                / session
              </span>
            </p>
          </div>
          <span className="text-sm font-medium text-ember transition group-hover:translate-x-1 motion-reduce:transform-none">
            View profile <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </button>
  );
}
