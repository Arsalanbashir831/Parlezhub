'use client';

import {
  Clock,
  DollarSign,
  Edit3,
  Eye,
  MoreVertical,
  Pause,
  Play,
  Star,
  Trash2,
} from 'lucide-react';

import { Service } from '@/types/service';
import {
  getServiceStatusColor,
  getServiceTypeLabel,
} from '@/lib/service-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ServiceCardProps {
  service: Service;
  onView?: (service: Service) => void;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onToggleStatus?: (service: Service) => void;
  showActions?: boolean;
}

export default function ServiceCard({
  service,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
}: ServiceCardProps) {
  console.log({ service });
  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus(service);
    }
  };

  const getStatusAction = () => {
    switch (service.status) {
      case 'active':
        return { label: 'Pause', icon: Pause };
      case 'inactive':
        return { label: 'Activate', icon: Play };
      default:
        return { label: 'Activate', icon: Play };
    }
  };

  const statusAction = getStatusAction();

  return (
    <Card className="h-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs capitalize">
              {getServiceTypeLabel(service.type)}
            </Badge>
            <Badge
              className={`text-xs ${getServiceStatusColor(service.status)}`}
            >
              {service.status}
            </Badge>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(service)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(service)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Service
                  </DropdownMenuItem>
                )}
                {onToggleStatus && (
                  <DropdownMenuItem onClick={handleToggleStatus}>
                    <statusAction.icon className="mr-2 h-4 w-4" />
                    {statusAction.label}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(service)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Service
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Title */}
        <div>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
            {service.title}
          </h3>
          <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
            {service.shortDescription}
          </p>
        </div>

        {/* Service Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {(service.averageRating ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {service.averageRating!.toFixed(1)}
                </span>
                <span className="text-gray-500">({service.reviewCount})</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{service.duration}min</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-lg font-semibold">
            <DollarSign className="h-4 w-4" />
            {service.price}
          </div>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {service.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{service.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Sessions Count - Only show if greater than 0 */}
        {(service.totalSessions ?? 0) > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {service.totalSessions} sessions completed
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(service)}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(service)}
                className="flex-1"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
