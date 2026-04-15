'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/services/blog';
import { toast } from 'sonner';

import type { BlogFormData, BlogPost } from '@/types/blog';

export interface UseBlogsParams {
  page?: number;
  page_size?: number;
  status?: 'draft' | 'published';
  search?: string;
  enabled?: boolean;
}

export function useBlogs(params: UseBlogsParams = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, ...queryParams } = params;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['blogs', queryParams],
    queryFn: () => blogService.list(queryParams),
    enabled,
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogService.create(data),
    onSuccess: () => {
      toast.success('Blog created');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: () => toast.error('Failed to create blog'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<BlogFormData> }) =>
      blogService.update(id, data),
    onSuccess: () => {
      toast.success('Blog updated');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: () => toast.error('Failed to update blog'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string | number) => blogService.remove(id),
    onSuccess: () => {
      toast.success('Blog deleted');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: () => toast.error('Failed to delete blog'),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string | number; status: BlogPost['status'] }) =>
      blogService.setStatus(id, status),
    onSuccess: (updated) => {
      toast.success(
        updated?.status === 'published' ? 'Blog published' : 'Saved as draft'
      );
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  return {
    blogs: data?.results || [],
    totalCount: data?.count || 0,
    hasNext: !!data?.next,
    hasPrevious: !!data?.previous,
    isLoading,
    error: error ? 'Failed to load blogs' : null,
    refresh: refetch,
    create: createMutation.mutateAsync,
    update: (id: string | number, data: Partial<BlogFormData>) => updateMutation.mutateAsync({ id, data }),
    remove: removeMutation.mutateAsync,
    toggleVisibility: async (id: string | number) => {
      const current = (await blogService.get(id))?.status;
      const next = current === 'published' ? 'draft' : 'published';
      return statusMutation.mutateAsync({ id, status: next });
    },
    loadOne: (id: string | number) => blogService.get(id),
    isProcessing: 
      createMutation.isPending || 
      updateMutation.isPending || 
      removeMutation.isPending || 
      statusMutation.isPending,
  };
}

export default useBlogs;
