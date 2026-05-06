import {
  Service,
  ServiceFormData,
  ServiceStatus,
  ServiceType,
} from '@/types/service';


export function getServiceTypeLabel(type: ServiceType): string {
  switch (type) {
    case 'language':
      return 'Language Consultation';
    case 'astrology':
      return 'Astrology Reading';
    case 'general':
      return 'General Consultancy';
    default:
      return type;
  }
}

export function getServiceStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'inactive':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
}
