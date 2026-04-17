import { API_ROUTES } from '@/constants/api-routes';

// Frontend-only Blog API (localStorage-backed for now)
import type { BlogFormData, BlogPost } from '@/types/blog';
import { ServiceFormData, ServiceStatus, ServiceType } from '@/types/service';
import apiCaller from '@/lib/api-caller';

// API Request/Response interfaces
export interface CreateServiceRequest {
  category: ServiceType;
  service_type: string;
  service_title: string;
  short_description: string;
  full_description: string;
  price_per_session: string;
  session_duration: number;
  tags: string[];
  what_you_provide_in_session: string;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  id: string;
}

export interface ServiceResponse {
  id: string | number;
  teacher: string | number;
  category: ServiceType;
  service_type: string;
  service_title: string;
  short_description: string;
  full_description: string;
  price_per_session: string;
  session_duration: number;
  tags: string[];
  what_you_provide_in_session: string;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  total_sessions?: number;
  average_rating?: number;
  review_count?: number;
}

export interface ServicesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceResponse[];
}

export interface PublicServiceResponse {
  id: number;
  consultant: number;
  teacher_details: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    profile_picture: string | null;
    qualification: string;
    experience_years: number;
    about: string;
    bio: string;
    city: string;
    country: string;
    native_language: string;
  };
  category: string;
  service_type: string;
  service_title: string;
  short_description: string;
  full_description: string;
  price_per_session: string;
  session_duration: number;
  tags: string[];
  what_you_provide_in_session: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PublicServicesListResponse {
  count: number;
  results: PublicServiceResponse[];
  filters_applied: {
    teacher_id: string | null;
    category: string | null;
    service_type: string | null;
    min_price: number | null;
    max_price: number | null;
    min_duration: number | null;
    max_duration: number | null;
    search: string | null;
    ordering: string;
  };
}

export interface PublicService {
  id: string;
  teacherId: string;
  consultantName: string;
  consultantAvatar: string | null;
  consultantQualification: string;
  consultantExperience: number;
  consultantBio: string;
  consultantLocation: string;
  consultantEmail: string;
  type: ServiceType;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: number;
  tags: string[];
  whatYouProvide: string[];
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

// Service API functions
export const serviceApi = {
  // Create a new service
  createService: async (
    data: CreateServiceRequest
  ): Promise<ServiceResponse> => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.CREATE_SERVICE,
      'POST',
      data as unknown as Record<
        string,
        string | number | boolean | File | Blob
      >,
      {},
      true // Use auth token
    );
    return response.data;
  },

  // Get all services for the current consultant
  getServices: async (): Promise<ServicesListResponse> => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.CREATE_SERVICE, // Using the same endpoint for GET
      'GET',
      undefined,
      {},
      true // Use auth token
    );

    // Handle both paginated response and direct array response
    if (response.data && Array.isArray(response.data)) {
      // Direct array response
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data,
      };
    } else {
      // Paginated response
      return response.data;
    }
  },

  // Get a specific service by ID
  getServiceById: async (serviceId: string): Promise<ServiceResponse> => {
    const response = await apiCaller(
      `${API_ROUTES.TEACHER.CREATE_SERVICE}${serviceId}/`,
      'GET',
      undefined,
      {},
      true // Use auth token
    );
    return response.data;
  },

  // Update a service
  updateService: async (
    serviceId: string,
    data: Partial<CreateServiceRequest>
  ): Promise<ServiceResponse> => {
    const response = await apiCaller(
      `${API_ROUTES.TEACHER.CREATE_SERVICE}${serviceId}/`,
      'PATCH',
      data as unknown as Record<
        string,
        string | number | boolean | File | Blob
      >,
      {},
      true // Use auth token
    );
    return response.data;
  },

  // Delete a service
  deleteService: async (serviceId: string): Promise<void> => {
    await apiCaller(
      `${API_ROUTES.TEACHER.CREATE_SERVICE}${serviceId}/`,
      'DELETE',
      undefined,
      {},
      true // Use auth token
    );
  },

  // Update service status
  updateServiceStatus: async (
    serviceId: string,
    status: 'active' | 'inactive'
  ): Promise<ServiceResponse> => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.UPDATE_SERVICE_STATUS(serviceId),
      'PATCH',
      { status },
      {},
      true // Use auth token
    );
    return response.data;
  },

  // Get all public services
  getPublicServices: async (): Promise<PublicServiceResponse[]> => {
    const response = await apiCaller(
      API_ROUTES.PUBLIC.GET_ALL_SERVICES,
      'GET',
      undefined,
      {},
      true
    );

    // Handle paginated response structure
    const data = response.data as
      | PublicServicesListResponse
      | PublicServiceResponse[];

    if (
      data &&
      typeof data === 'object' &&
      'results' in data &&
      Array.isArray(data.results)
    ) {
      // Paginated response
      return data.results;
    } else if (Array.isArray(data)) {
      // Direct array response (fallback)
      return data;
    } else {
      // Invalid response structure
      console.error('Invalid API response structure:', data);
      return [];
    }
  },

  // Get services for a specific consultant
  getConsultantServices: async (
    teacherId: string
  ): Promise<PublicServiceResponse[]> => {
    const response = await apiCaller(
      `${API_ROUTES.PUBLIC.GET_ALL_SERVICES}?teacher_id=${teacherId}`,
      'GET',
      undefined,
      {},
      true
    );

    // Handle paginated response structure
    const data = response.data as
      | PublicServicesListResponse
      | PublicServiceResponse[];

    if (
      data &&
      typeof data === 'object' &&
      'results' in data &&
      Array.isArray(data.results)
    ) {
      // Paginated response
      return data.results;
    } else if (Array.isArray(data)) {
      // Direct array response (fallback)
      return data;
    } else {
      // Invalid response structure
      console.error('Invalid API response structure:', data);
      return [];
    }
  },
};

export const blogApi = {
  list: async (): Promise<BlogPost[]> => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('consultant_blogs');
    return raw ? (JSON.parse(raw) as BlogPost[]) : [];
  },
  create: async (data: BlogFormData): Promise<BlogPost> => {
    const all = await blogApi.list();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const post: BlogPost = {
      id: Number(id),
      title: data.title,
      slug,
      content: data.content,
      thumbnail: data.thumbnail?.toString(),
      tags: data.tags || [],
      status: data.status || 'published',
      created_at: now,
      updated_at: now,
      tag_list: data.tags.join(','),
      author_name: 'Consultant',
      published_at: now,
      read_time: 0,
      view_count: 0,
      is_published: true,
    };
    const updated = [post, ...all];
    localStorage.setItem('consultant_blogs', JSON.stringify(updated));
    return post;
  },
  get: async (id: string): Promise<BlogPost | null> => {
    const all = await blogApi.list();
    // Ensure both id and b.id are compared as strings to avoid type mismatch
    return all.find((b) => String(b.id) === String(id)) || null;
  },
  update: async (
    id: string,
    data: Partial<BlogFormData>
  ): Promise<BlogPost | null> => {
    const all = await blogApi.list();
    const idx = all.findIndex((b) => String(b.id) === String(id));
    if (idx === -1) return null;
    const updated: BlogPost = {
      ...all[idx],
      ...data,
      thumbnail:
        data.thumbnail !== undefined
          ? typeof data.thumbnail === 'string'
            ? data.thumbnail
            : data.thumbnail
              ? data.thumbnail.toString()
              : undefined
          : all[idx].thumbnail?.toString(),
      updated_at: new Date().toISOString(),
    };
    all[idx] = updated;
    localStorage.setItem('consultant_blogs', JSON.stringify(all));
    return updated;
  },
  remove: async (id: string): Promise<void> => {
    const all = await blogApi.list();
    // Ensure both id and b.id are compared as strings to avoid type mismatch
    const filtered = all.filter((b) => String(b.id) !== String(id));
    localStorage.setItem('consultant_blogs', JSON.stringify(filtered));
    return;
  },
  toggleVisibility: async (id: string): Promise<BlogPost | null> => {
    const all = await blogApi.list();
    const idx = all.findIndex((b) => String(b.id) === String(id));
    if (idx === -1) return null;
    const nextStatus = all[idx].status === 'published' ? 'draft' : 'published';
    all[idx] = {
      ...all[idx],
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };
    return all[idx];
  },
};

// Utility functions to convert between frontend and API formats
export const serviceUtils = {
  // Convert frontend ServiceFormData to API CreateServiceRequest
  formDataToApiRequest: (formData: ServiceFormData): CreateServiceRequest => {
    return {
      category: formData.type,
      service_type:
        formData.type === 'language'
          ? 'Language Consultation'
          : 'Astrology Reading',
      service_title: formData.title,
      short_description: formData.shortDescription,
      full_description: formData.description,
      price_per_session: formData.price.toString(),
      session_duration: formData.duration,
      tags: formData.tags,
      what_you_provide_in_session: formData.whatYouProvide.join(', '),
    };
  },

  // Convert API ServiceResponse to frontend Service
  apiResponseToService: (apiResponse: ServiceResponse): unknown => {
    return {
      id: apiResponse.id?.toString?.() ?? '', // Convert to string to ensure consistency
      teacherId:
        apiResponse.teacher !== undefined && apiResponse.teacher !== null
          ? apiResponse.teacher.toString()
          : '',
      type: apiResponse.category,
      title: apiResponse.service_title,
      description: apiResponse.full_description,
      shortDescription: apiResponse.short_description,
      price: parseFloat(apiResponse.price_per_session),
      duration: apiResponse.session_duration,
      tags: apiResponse.tags,
      whatYouProvide:
        apiResponse.what_you_provide_in_session?.split(', ').filter(Boolean) ??
        [],
      status: apiResponse.status || 'active', // Default to active if status is missing
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      totalSessions: apiResponse.total_sessions || 0,
      averageRating: apiResponse.average_rating || 0,
      reviewCount: apiResponse.review_count || 0,
    };
  },

  // Convert public service API response to frontend format
  publicApiResponseToService: (
    apiResponse: PublicServiceResponse
  ): PublicService => {
    return {
      id: apiResponse.id.toString(),
      teacherId: apiResponse.teacher_details.id,
      consultantName: apiResponse.teacher_details.full_name,
      consultantAvatar: apiResponse.teacher_details.profile_picture,
      consultantQualification: apiResponse.teacher_details.qualification,
      consultantExperience: apiResponse.teacher_details.experience_years,
      consultantBio: apiResponse.teacher_details.bio,
      consultantLocation:
        `${apiResponse.teacher_details.city}, ${apiResponse.teacher_details.country}`
          .replace(/^,\s*/, '')
          .replace(/,\s*$/, ''),
      consultantEmail: apiResponse.teacher_details.email,
      type: apiResponse.category as ServiceType,
      title: apiResponse.service_title,
      description: apiResponse.full_description,
      shortDescription: apiResponse.short_description,
      price: parseFloat(apiResponse.price_per_session),
      duration: apiResponse.session_duration,
      tags: apiResponse.tags,
      whatYouProvide: apiResponse.what_you_provide_in_session
        .split(', ')
        .filter(Boolean),
      status: apiResponse.status as ServiceStatus,
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
    };
  },
};
