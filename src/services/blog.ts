import { API_ROUTES } from '@/constants/api-routes';

import type {
  BlogFormData,
  BlogListParams,
  BlogListResponse,
  BlogPost,
  BlogStatus,
} from '@/types/blog';
import apiCaller from '@/lib/api-caller';

const { BLOGS, BLOG_DETAIL } = API_ROUTES.TEACHER;

/** Only the fields that are set, so a partial update never sends "undefined". */
function toFormData(data: Partial<BlogFormData>): FormData {
  const form = new FormData();
  if (data.title !== undefined) form.append('title', data.title);
  if (data.content !== undefined) form.append('content', data.content);
  if (data.status !== undefined) form.append('status', data.status);
  if (data.tags !== undefined) form.append('tags', JSON.stringify(data.tags));
  if (data.meta_description !== undefined) {
    form.append('meta_description', data.meta_description);
  }
  if (data.thumbnail) form.append('thumbnail', data.thumbnail);
  return form;
}

export const blogService = {
  /** The signed-in consultant's posts, paginated and filtered by the server. */
  list: async (params: BlogListParams = {}): Promise<BlogListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.page_size) query.set('page_size', String(params.page_size));
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    const response = await apiCaller(qs ? `${BLOGS}?${qs}` : BLOGS, 'GET', undefined, {}, true);
    return response.data;
  },

  get: async (id: string | number): Promise<BlogPost> => {
    const response = await apiCaller(BLOG_DETAIL(id), 'GET', undefined, {}, true);
    return response.data;
  },

  create: async (data: BlogFormData): Promise<BlogPost> => {
    const response = await apiCaller(BLOGS, 'POST', toFormData(data), {}, true, 'formdata');
    return response.data;
  },

  update: async (id: string | number, data: Partial<BlogFormData>): Promise<BlogPost> => {
    const response = await apiCaller(BLOG_DETAIL(id), 'PATCH', toFormData(data), {}, true, 'formdata');
    return response.data;
  },

  setStatus: (id: string | number, status: BlogStatus) => blogService.update(id, { status }),

  remove: async (id: string | number): Promise<void> => {
    await apiCaller(BLOG_DETAIL(id), 'DELETE', undefined, {}, true);
  },
};

export default blogService;
