'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useUser } from '@/contexts/user-context';
import { chatService } from '@/services/chat';
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

import { Service } from '@/types/service';
import { getServiceTypeLabel } from '@/lib/service-utils';
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

import { ScrollArea } from '../ui/scroll-area';

interface ServiceDetailsModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (service: Service) => void;
}

export function ServiceDetailsModal({
  service,
  isOpen,
  onClose,
  onEdit,
}: ServiceDetailsModalProps) {
  const router = useRouter();
  const { user } = useUser();

  if (!service) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        toast.success('Chat started successfully');
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
      <DialogContent className="max-w-2xl">
        <ScrollArea className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {getServiceTypeLabel(service.type)}
                  </Badge>
                  {/* Removed service status badge for public/students */}
                </div>
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {service.title}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-gray-500">
                  {service.shortDescription}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Service Stats */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Price
                  </p>
                  <p className="font-semibold">${service.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duration
                  </p>
                  <p className="font-semibold">{service.duration} minutes</p>
                </div>
              </div>
              {(service.averageRating ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rating
                    </p>
                    <p className="font-semibold">
                      {service.averageRating!.toFixed(1)} ({service.reviewCount}{' '}
                      reviews)
                    </p>
                  </div>
                </div>
              )}
              {(service.totalSessions ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sessions
                    </p>
                    <p className="font-semibold">
                      {service.totalSessions} completed
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Short Description */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">Overview</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {service.shortDescription}
              </p>
            </div>

            {/* Full Description */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Detailed Description
              </h3>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {service.description}
              </p>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* What You Provide */}
            {service.whatYouProvide && service.whatYouProvide.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-semibold">What You Provide</h3>
                <ul className="space-y-1">
                  {service.whatYouProvide.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Service Metadata */}
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(service.createdAt)}</span>
              </div>
              {service.updatedAt !== service.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last updated: {formatDate(service.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onEdit ? (
                <Button onClick={() => onEdit(service)}>Edit Service</Button>
              ) : (
                <Button onClick={handleStartChat}>Chat with Consultant</Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
