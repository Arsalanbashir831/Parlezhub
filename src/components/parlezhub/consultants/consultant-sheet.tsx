'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Clock3, Loader2, MapPin, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/constants/routes';
import { useUser } from '@/contexts/user-context';
import type { ConsultantProfile } from '@/lib/astrologer-directory';
import { getErrorMessage } from '@/lib/error-utils';
import { chatService } from '@/services/chat';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { buttonStyles } from '@/components/parlezhub/ui';

import { ConsultantAvatar } from './consultant-card';

/** A language consultant's profile and gigs, with the way to reach them. */
export function ConsultantSheet({
  profile,
  onClose,
}: {
  profile: ConsultantProfile | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [isStarting, setIsStarting] = useState(false);

  const startChat = async () => {
    if (!profile || isStarting) return;
    if (!user) {
      toast.error('Please sign in to start a chat');
      return;
    }
    // A learner who is also this consultant would open a chat with themself.
    if (String(user.id) === String(profile.id)) {
      toast.error('This is your own consultant profile');
      return;
    }
    setIsStarting(true);
    try {
      const chat = await chatService.createChat({ student_id: user.id, teacher_id: profile.id });
      if (!chat?.id) throw new Error('Chat was not created');
      onClose();
      router.push(`${ROUTES.PARLEZHUB.CHAT}?chatId=${encodeURIComponent(chat.id)}`);
    } catch (error) {
      toast.error('Could not start this chat', { description: getErrorMessage(error) });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Sheet open={Boolean(profile)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 border-l border-border bg-card p-0 sm:max-w-lg">
        {profile && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SheetHeader className="space-y-0 border-b border-border px-6 pb-6 pt-10 text-left">
                <div className="flex items-center gap-4">
                  <ConsultantAvatar profile={profile} size="lg" />
                  <div className="min-w-0">
                    <SheetTitle className="text-xl font-extrabold text-foreground">{profile.name}</SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground">
                      {profile.qualification || 'Language consultant'}
                    </SheetDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 pt-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                      {profile.location}
                    </span>
                  )}
                  {profile.experience > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                      {profile.experience} {profile.experience === 1 ? 'year' : 'years'} teaching
                    </span>
                  )}
                </div>
              </SheetHeader>

              <div className="space-y-7 px-6 py-6">
                {profile.bio && (
                  <section>
                    <h3 className="text-sm font-bold text-foreground">About</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {profile.bio}
                    </p>
                  </section>
                )}

                {profile.specialties.length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold text-foreground">Focus areas</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {profile.specialties.map((tag) => (
                        <li key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h3 className="text-sm font-bold text-foreground">
                    Sessions <span className="font-normal text-muted-foreground">({profile.services.length})</span>
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {profile.services.map((service) => (
                      <li key={service.id}>
                        <details className="group rounded-xl border border-border open:border-primary/40">
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-foreground">{service.title}</span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {service.duration} min · ${service.price}
                              </span>
                            </span>
                            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                          </summary>
                          <div className="space-y-3 border-t border-border px-4 pb-4 pt-3 text-sm text-muted-foreground">
                            {(service.description || service.shortDescription) && (
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {service.description || service.shortDescription}
                              </p>
                            )}
                            {service.whatYouProvide.length > 0 && (
                              <ul className="space-y-1">
                                {service.whatYouProvide.map((item, index) => (
                                  <li key={`${index}-${item}`} className="flex gap-2">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t border-border p-4">
              <button type="button" onClick={startChat} disabled={isStarting} className={`${buttonStyles.primary} w-full`}>
                {isStarting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                )}
                {isStarting ? 'Starting chat…' : `Message ${profile.name.split(' ')[0]}`}
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Ask a question first, then book a session from the chat.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
