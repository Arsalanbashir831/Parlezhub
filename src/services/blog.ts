import { API_ROUTES } from '@/constants/api-routes';
import { toast } from 'sonner';

import type { BlogFormData, BlogListResponse, BlogPost } from '@/types/blog';
import apiCaller from '@/lib/api-caller';

// Helper function to convert BlogFormData to FormData for API
function createFormData(data: BlogFormData): FormData {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('status', data.status);
  formData.append('tags', JSON.stringify(data.tags));

  if (data.meta_description) {
    formData.append('meta_description', data.meta_description);
  }

  if (data.thumbnail) {
    formData.append('thumbnail', data.thumbnail);
  }

  return formData;
}

export const blogService = {
  // Get all blogs for the current consultant with pagination and filters
  list: async (params?: {
    page?: number;
    page_size?: number;
    status?: 'draft' | 'published';
    search?: string;
  }): Promise<BlogListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size)
      queryParams.append('page_size', params.page_size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_ROUTES.TEACHER.BLOGS}?${queryParams.toString()}`;

    const response = await apiCaller(
      url,
      'GET',
      undefined,
      {},
      true // Use auth token
    );
    return response.data;
  },

  // Create a new blog
  create: async (data: BlogFormData): Promise<BlogPost> => {
    const formData = createFormData(data);

    const response = await apiCaller(
      API_ROUTES.TEACHER.CREATE_BLOG,
      'POST',
      formData,
      {},
      true, // Use auth token
      'formdata' // Data type
    );
    return response.data;
  },

  // Get a specific blog by ID
  get: async (id: string | number): Promise<BlogPost | null> => {
    try {
      const response = await apiCaller(
        API_ROUTES.TEACHER.BLOG_DETAIL(id),
        'GET',
        undefined,
        {},
        true // Use auth token
      );
      return response.data;
    } catch {
      toast.error('Failed to get blog');
      return null;
    }
  },

  // Update a blog
  update: async (
    id: string | number,
    data: Partial<BlogFormData>
  ): Promise<BlogPost | null> => {
    try {
      const formData = createFormData(data as BlogFormData);

      const response = await apiCaller(
        API_ROUTES.TEACHER.UPDATE_BLOG(id),
        'PUT',
        formData,
        {},
        true, // Use auth token
        'formdata' // Data type
      );
      return response.data;
    } catch {
      toast.error('Failed to update blog');
      return null;
    }
  },

  // Delete a blog
  remove: async (id: string | number): Promise<void> => {
    await apiCaller(
      API_ROUTES.TEACHER.DELETE_BLOG(id),
      'DELETE',
      undefined,
      {},
      true // Use auth token
    );
  },

  // Toggle blog status (publish/draft)
  setStatus: async (
    id: string | number,
    status: BlogPost['status']
  ): Promise<BlogPost | null> => {
    try {
      const formData = new FormData();
      formData.append('status', status);

      const response = await apiCaller(
        API_ROUTES.TEACHER.UPDATE_BLOG(id),
        'PATCH',
        formData,
        {},
        true, // Use auth token
        'formdata' // Data type
      );
      return response.data;
    } catch {
      toast.error('Failed to set blog status');
      return null;
    }
  },

  // Legacy method for backward compatibility - remove after migration
  seedIfEmpty: async () => {
    // No longer needed with API
    return;
  },
};

export default blogService;
