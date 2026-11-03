'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useUser } from '@/contexts/user-context';
import { chatService } from '@/services/chat';
import { getErrorMessage } from '@/lib/error-utils';
import {
  ArrowUpRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import type { AstrologerProfile } from '@/lib/astrologer-directory';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AstrologerProfileDrawerProps {
  profile: AstrologerProfile | null;
  onClose: () => void;
}

export function AstrologerProfileDrawer({
  profile,
  onClose,
}: AstrologerProfileDrawerProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async () => {
    if (!profile || isStartingChat) return;
    if (!user) {
      toast.error('Please log in to start a chat');
      return;
    }
    // A consultant account listing itself as an astrologer would otherwise open a
    // chat with yourself, which the server rejects but the row can already exist.
    if (String(user.id) === String(profile.id)) {
      toast.error('This is your own consultant profile', {
        description: 'Students start the conversation from their side.',
      });
      return;
    }
    setIsStartingChat(true);
    try {
      const chat = await chatService.createChat({
        student_id: user.id,
        teacher_id: profile.id,
      });
      if (!chat?.id) throw new Error('Chat was not created');
      toast.success(`Chat started with ${profile.name}`);
      onClose();
      router.push(
        `${ROUTES.AGENT.ASTROLOGY.HIRE.CHAT}?chatId=${encodeURIComponent(chat.id)}`
      );
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Could not start this chat', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsStartingChat(false);
    }
  };

  const initials =
    profile?.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'A';

  return (
    <Sheet
      open={Boolean(profile)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex h-dvh w-full max-w-none flex-col gap-0 overflow-hidden border-l border-white/10 bg-[#0b0b0a] p-0 sm:max-w-[38rem]">
        {profile && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="bg-[radial-gradient(ellipse_at_90%_0%,rgba(255,163,90,0.16),transparent_50%),linear-gradient(#1a1714,#10100f)] px-6 pb-8 pt-11 sm:px-9">
                <p className="mb-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ember">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />{' '}
                  Astrologer profile
                </p>
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 border-2 border-ember/35 bg-[#35291e] sm:h-24 sm:w-24">
                    <AvatarImage
                      src={profile.avatar || undefined}
                      alt=""
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#35291e] text-2xl font-semibold text-ember-soft">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <SheetHeader className="min-w-0 flex-1 space-y-1 text-left">
                    <SheetTitle className="break-words pr-5 font-serif text-2xl leading-tight text-white sm:text-3xl">
                      {profile.name}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-white/60">
                      {profile.qualification || 'Astrology consultant'}
                    </SheetDescription>
                  </SheetHeader>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
                  {profile.location && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin
                        className="h-4 w-4 text-ember"
                        aria-hidden="true"
                      />
                      {profile.location}
                    </span>
                  )}
                  {profile.experience > 0 && (
                    <span className="inline-flex items-center gap-2">
                      <Clock3
                        className="h-4 w-4 text-ember"
                        aria-hidden="true"
                      />
                      {profile.experience} years experience
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-9 px-6 py-8 sm:px-9">
                {profile.bio && (
                  <section aria-labelledby="profile-about">
                    <h3
                      id="profile-about"
                      className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember"
                    >
                      About
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/75">
                      {profile.bio}
                    </p>
                  </section>
                )}
                {profile.specialties.length > 0 && (
                  <section aria-labelledby="profile-expertise">
                    <h3
                      id="profile-expertise"
                      className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ember"
                    >
                      Areas of focus
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-ember/20 bg-ember/[0.07] px-3 py-1.5 text-xs text-ember-soft"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                <section aria-labelledby="profile-sessions">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <h3
                        id="profile-sessions"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-ember"
                      >
                        Available sessions
                      </h3>
                      <p className="mt-1 text-sm text-white/50">
                        Explore what this astrologer offers
                      </p>
                    </div>
                    <span className="text-xs text-white/45">
                      {profile.services.length}{' '}
                      {profile.services.length === 1 ? 'service' : 'services'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {profile.services.map((service) => (
                      <details
                        key={service.id}
                        className="group rounded-2xl border border-white/10 bg-white/[0.035] open:border-ember/25"
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-5 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0">
                            <span className="block font-medium leading-snug text-white">
                              {service.title}
                            </span>
                            <span className="mt-2 block text-xs text-white/55">
                              {service.duration} min session · ${service.price}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="mt-0.5 h-4 w-4 shrink-0 text-ember transition group-open:rotate-45"
                            aria-hidden="true"
                          />
                        </summary>
                        <div className="space-y-4 border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-6 text-white/70">
                          {(service.description ||
                            service.shortDescription) && (
                            <p className="whitespace-pre-wrap">
                              {service.description || service.shortDescription}
                            </p>
                          )}
                          {service.whatYouProvide?.length > 0 && (
                            <div>
                              <p className="mb-2 font-medium text-white">
                                What you’ll get
                              </p>
                              <ul className="space-y-1.5">
                                {service.whatYouProvide.map((item, index) => (
                                  <li
                                    key={`${index}-${item}`}
                                    className="flex items-start gap-2"
                                  >
                                    <Check
                                      className="mt-1 h-3.5 w-3.5 shrink-0 text-ember"
                                      aria-hidden="true"
                                    />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              </div>
            </div>
            <div className="shrink-0 border-t border-white/10 bg-[#11110f] px-6 py-4 sm:px-9">
              <Button
                onClick={handleStartChat}
                disabled={isStartingChat}
                className="h-12 w-full rounded-xl bg-ember font-semibold text-black hover:bg-ember-soft focus-visible:ring-ember"
              >
                {isStartingChat ? (
                  'Starting chat…'
                ) : (
                  <>
                    <MessageCircle aria-hidden="true" /> Chat with{' '}
                    {profile.name}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
