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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ServiceDetailsModalProps {
  serviceCard: ServiceCardData | null;
  isOpen: boolean;
  onClose: () => void;
  footerAction?: React.ReactNode;
}

export function ServiceDetailsModal({
  serviceCard,
  isOpen,
  onClose,
  footerAction,
}: ServiceDetailsModalProps) {
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
        teacher_id: service.teacherId,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto overflow-x-hidden rounded-3xl border border-primary-500/10 bg-background p-0 shadow-2xl sm:max-w-lg md:max-w-3xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-start justify-between text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary-500/30 text-[10px] font-bold uppercase tracking-widest text-primary-400"
                >
                  {getServiceTypeLabel(service.type)}
                </Badge>
              </div>
              <DialogTitle className="break-words font-serif text-2xl font-bold leading-tight text-primary-500 sm:text-3xl">
                {service.title}
              </DialogTitle>
              <DialogDescription className="mt-2 line-clamp-2 text-sm font-medium text-primary-100/60">
                {service.shortDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 px-6 pb-6">
          {/* Consultant Information */}
          <div className="rounded-2xl border border-primary-500/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-300">
              About the Consultant
            </h3>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 shrink-0 border-2 border-primary-500/20">
                <AvatarImage
                  src={consultantAvatar || '/placeholders/avatar.jpg'}
                />
                <AvatarFallback className="bg-primary-500/10 text-lg text-primary-300">
                  {consultantName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <h4 className="truncate text-lg font-bold text-white sm:whitespace-normal">
                    {consultantName}
                  </h4>
                  {consultantQualification && (
                    <p className="line-clamp-2 text-sm text-primary-400">
                      {consultantQualification}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary-100/50">
                  {consultantLocation && (
                    <div className="flex items-center gap-1.5 brightness-150 grayscale">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{consultantLocation}</span>
                    </div>
                  )}
                  {consultantExperience > 0 && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{consultantExperience}+ yrs exp</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {consultantBio && (
              <p className="mt-4 break-words text-sm leading-relaxed text-primary-100/80">
                {consultantBio}
              </p>
            )}
          </div>

          {/* Service Statistics */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-primary-500/10 bg-white/5 p-6 sm:grid-cols-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-primary-500">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-primary-400">
                  Rate
                </p>
                <p className="break-words text-2xl font-bold text-white">
                  ${service.price}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-primary-500">
                <Clock className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-primary-400">
                  Duration
                </p>
                <p className="break-words text-2xl font-bold text-white">
                  {service.duration}m
                </p>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-300">
                Service Overview
              </h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-primary-100/90">
                {service.shortDescription}
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-300">
                Detailed Vision
              </h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-primary-100/80">
                {service.description}
              </p>
            </div>
          </div>

          {/* Expertise & Deliverables */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                      className="border border-primary-500/20 bg-primary-500/10 font-medium text-primary-300 hover:bg-primary-500/20"
                    >
                      <Tag className="mr-1.5 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {service.whatYouProvide && service.whatYouProvide.length > 0 && (
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-300">
                  What You&rsquo;ll Get
                </h3>
                <ul className="space-y-3">
                  {service.whatYouProvide.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                      <span className="break-words text-sm font-medium leading-relaxed text-primary-100/80">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Separator className="bg-primary-500/10" />

          {/* Action Buttons */}
          <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full rounded-xl border-primary-500/30 text-primary-400 transition-all hover:bg-primary-500/10 hover:text-primary-300 sm:w-auto"
            >
              Close
            </Button>
            {footerAction ? (
              footerAction
            ) : (
              <Button
                onClick={handleStartChat}
                className="w-full rounded-xl bg-primary-500 px-8 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95 sm:w-auto"
              >
                Chat with {consultantName}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
