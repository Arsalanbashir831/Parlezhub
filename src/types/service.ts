export type ServiceCategory = 'language' | 'astrology';
export type ServiceType = 'language' | 'astrology' | 'general';

export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: string;
  teacherId: string;
  type: ServiceType;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: number; // in minutes
  tags: string[];
  whatYouProvide: string[];
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  totalSessions?: number;
  averageRating?: number;
  reviewCount?: number;
}

export interface ServiceFormData {
  type: ServiceType;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: number;
  tags: string[];
  whatYouProvide: string[];
}

export interface ServiceFilters {
  type?: ServiceType;
  status?: ServiceStatus;
  searchQuery?: string;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
}
