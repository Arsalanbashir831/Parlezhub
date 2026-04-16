'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useUser } from '@/contexts/user-context';
import { chatService } from '@/services/chat';
import {
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { getServiceTypeLabel } from '@/lib/service-utils';
import { ServiceCardData } from '@/hooks/useConsultants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ServiceDetailsDrawerProps {
  serviceCard: ServiceCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailsDrawer({
  serviceCard,
  isOpen,
  onClose,
}: ServiceDetailsDrawerProps) {
  const router = useRouter();
  const { user } = useUser();

  if (!serviceCard) return null;

  const {
    service,
    consultantName,
    consultantAvatar,
    consultantQualification,
    consultantExperience,
    consultantBio,
    consultantLocation,
  } = serviceCard;

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Please log in to start a chat');
      return;
    }

    try {
      // Create a new chat with the consultant
      const newChat = await chatService.createChat({
        student_id: user.id,
        consultant_id: service.teacherId,
      });

      if (newChat) {
        toast.success(`Chat started with ${consultantName}`);
        // Navigate to the chat page with chatId param
        router.push(`${ROUTES.STUDENT.CHAT}?chatId=${newChat.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto border-l border-primary-500/10 bg-background shadow-2xl sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary-500/30 text-xs font-bold uppercase tracking-widest text-primary-400"
                >
                  {getServiceTypeLabel(service.type)}
                </Badge>
              </div>
              <SheetTitle className="font-serif text-3xl font-bold leading-tight text-primary-500">
                {service.title}
              </SheetTitle>
              <SheetDescription className="mt-2 line-clamp-2 text-sm font-medium text-primary-100/60">
                {service.shortDescription}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-2 py-6">
          {/* Consultant Information */}
          <div className="rounded-2xl border border-primary-500/10 bg-white/5 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-300">
              About the Consultant
            </h3>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={consultantAvatar || '/placeholders/avatar.jpg'}
                />
                <AvatarFallback className="bg-primary-500/20 text-lg text-primary-300">
                  {consultantName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {consultantName}
                  </h4>
                  {consultantQualification && (
                    <p className="text-sm text-primary-400">
                      {consultantQualification}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-primary-100/60">
                  {consultantLocation && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary-500/70" />
                      <span>{consultantLocation}</span>
                    </div>
                  )}
                  {consultantExperience > 0 && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary-500/70" />
                      <span>{consultantExperience}+ yrs exp</span>
                    </div>
                  )}
                </div>
                {consultantBio && (
                  <p className="text-sm leading-relaxed text-primary-100/80">
                    {consultantBio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service Statistics */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-primary-500/10 bg-white/5 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-500">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
                  Rate
                </p>
                <p className="text-xl font-bold text-white">${service.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
                  Duration
                </p>
                <p className="text-xl font-bold text-white">
                  {service.duration}m
                </p>
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-300">
                Service Overview
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary-100/90">
                {service.shortDescription}
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-300">
                Detailed Description
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary-100/80">
                {service.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-300">
                Expertise Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="border border-primary-500/20 bg-primary-500/10 font-medium text-primary-400 hover:bg-primary-500/20"
                  >
                    <Tag className="mr-1.5 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* What You Provide */}
          {service.whatYouProvide && service.whatYouProvide.length > 0 && (
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-300">
                What You&rsquo;ll Get
              </h3>
              <ul className="space-y-3">
                {service.whatYouProvide.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                    <span className="text-sm leading-relaxed text-primary-100/80">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator className="bg-primary-500/10" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-primary-500/30 text-primary-400 transition-all hover:bg-primary-500/10 hover:text-primary-300"
            >
              Close
            </Button>
            <Button
              onClick={handleStartChat}
              className="bg-primary-500 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
            >
              Chat with {consultantName}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
