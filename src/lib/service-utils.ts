import {
  Service,
  ServiceFormData,
  ServiceStatus,
  ServiceType,
} from '@/types/service';

const SERVICES_STORAGE_KEY = 'teacher_services';

// Mock data for initial services
const mockServices: Service[] = [
  {
    id: 'service-1',
    teacherId: 'teacher-1',
    type: 'language',
    title: 'Business Spanish Consultation',
    description:
      "Get personalized guidance on improving your business Spanish communication skills. I'll analyze your current level and provide a detailed roadmap for improvement.",
    shortDescription:
      'Personalized business Spanish consultation and improvement roadmap',
    price: 50,
    duration: 60,
    tags: ['Business Spanish', 'Consultation', 'Professional', 'Career'],
    whatYouProvide: [
      '1-hour consultation session',
      'Personalized improvement plan',
      'Resource recommendations',
      'Follow-up email summary',
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    totalSessions: 12,
    averageRating: 4.8,
    reviewCount: 10,
  },
];

export function loadServices(): Service[] {
  if (typeof window === 'undefined') return mockServices;

  try {
    const stored = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Initialize with mock data
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(mockServices));
    return mockServices;
  } catch (error) {
    console.error('Error loading services:', error);
    return mockServices;
  }
}

export function saveServices(services: Service[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (error) {
    console.error('Error saving services:', error);
  }
}

export function createService(
  formData: ServiceFormData,
  teacherId: string
): Service {
  const now = new Date().toISOString();
  const newService: Service = {
    id: `service-${Date.now()}`,
    teacherId,
    ...formData,
    status: 'active', // New services are set to active by default
    createdAt: now,
    updatedAt: now,
    totalSessions: 0,
    averageRating: 0,
    reviewCount: 0,
  };

  const services = loadServices();
  services.push(newService);
  saveServices(services);

  return newService;
}

export function updateService(
  serviceId: string,
  updates: Partial<ServiceFormData>
): Service | null {
  const services = loadServices();
  const serviceIndex = services.findIndex((s) => s.id === serviceId);

  if (serviceIndex === -1) return null;

  const updatedService = {
    ...services[serviceIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  services[serviceIndex] = updatedService;
  saveServices(services);

  return updatedService;
}

export function deleteService(serviceId: string): boolean {
  const services = loadServices();
  const filteredServices = services.filter((s) => s.id !== serviceId);

  if (filteredServices.length === services.length) return false;

  saveServices(filteredServices);
  return true;
}

export function getServicesByTeacher(teacherId: string): Service[] {
  const services = loadServices();
  return services.filter((s) => s.teacherId === teacherId);
}

export function getServiceById(serviceId: string): Service | null {
  const services = loadServices();
  return services.find((s) => s.id === serviceId) || null;
}

export function canCreateServiceType(
  teacherId: string,
  type: ServiceType
): boolean {
  const teacherServices = getServicesByTeacher(teacherId);
  return !teacherServices.some((service) => service.type === type);
}

export function updateServiceStatus(
  serviceId: string,
  status: ServiceStatus
): Service | null {
  const services = loadServices();
  const serviceIndex = services.findIndex((s) => s.id === serviceId);

  if (serviceIndex === -1) return null;

  services[serviceIndex] = {
    ...services[serviceIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveServices(services);
  return services[serviceIndex];
}

export function getServiceTypeLabel(type: ServiceType): string {
  switch (type) {
    case 'language':
      return 'Language Consultation';
    case 'astrology':
      return 'Astrology Reading';
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
