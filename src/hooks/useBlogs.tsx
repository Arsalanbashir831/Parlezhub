'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/services/blog';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';

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

  // Memoize queryParams to prevent unnecessary re-fetches
  const { page, page_size, status, search } = queryParams;
  const memoizedQueryParams = useMemo(
    () => ({ page, page_size, status, search }),
    [page, page_size, status, search]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['blogs', memoizedQueryParams],
    queryFn: () => blogService.list(memoizedQueryParams),
    enabled,
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogService.create(data),
    onSuccess: () => {
      toast.success('Blog created');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) =>
      toast.error('Failed to create blog', {
        description: getErrorMessage(error),
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<BlogFormData>;
    }) => blogService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) =>
      toast.error('Failed to update blog', {
        description: getErrorMessage(error),
      }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string | number) => blogService.remove(id),
    onSuccess: () => {
      toast.success('Blog deleted');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) =>
      toast.error('Failed to delete blog', {
        description: getErrorMessage(error),
      }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string | number;
      status: BlogPost['status'];
    }) => blogService.setStatus(id, status),
    onSuccess: (updated) => {
      toast.success(
        updated?.status === 'published' ? 'Blog published' : 'Saved as draft'
      );
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) =>
      toast.error('Failed to update status', {
        description: getErrorMessage(error),
      }),
  });

  const create = useCallback(
    async (formData: BlogFormData) => {
      return createMutation.mutateAsync(formData);
    },
    [createMutation]
  );

  const update = useCallback(
    (id: string | number, data: Partial<BlogFormData>) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const remove = useCallback(
    (id: string | number) => removeMutation.mutateAsync(id),
    [removeMutation]
  );

  const toggleVisibility = useCallback(
    async (id: string | number) => {
      const current = (await blogService.get(id))?.status;
      const next = current === 'published' ? 'draft' : 'published';
      return statusMutation.mutateAsync({ id, status: next });
    },
    [statusMutation]
  );

  const loadOne = useCallback((id: string | number) => blogService.get(id), []);

  return useMemo(
    () => ({
      blogs: data?.results || [],
      totalCount: data?.count || 0,
      hasNext: !!data?.next,
      hasPrevious: !!data?.previous,
      isLoading,
      error: error ? 'Failed to load blogs' : null,
      refresh: refetch,
      create,
      update,
      remove,
      toggleVisibility,
      loadOne,
      isProcessing:
        createMutation.isPending ||
        updateMutation.isPending ||
        removeMutation.isPending ||
        statusMutation.isPending,
    }),
    [
      data,
      isLoading,
      error,
      refetch,
      create,
      update,
      remove,
      toggleVisibility,
      loadOne,
      createMutation.isPending,
      updateMutation.isPending,
      removeMutation.isPending,
      statusMutation.isPending,
    ]
  );
}

export default useBlogs;
