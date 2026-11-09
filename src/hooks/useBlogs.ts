'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/error-utils';
import { blogService } from '@/services/blog';
import type { BlogFormData, BlogListParams, BlogStatus } from '@/types/blog';

const BLOGS_KEY = ['blogs'] as const;

/** The consultant's posts for one page of the listing. */
export function useBlogList(params: BlogListParams) {
  const query = useQuery({
    queryKey: [...BLOGS_KEY, 'list', params],
    queryFn: () => blogService.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  return {
    blogs: query.data?.results ?? [],
    totalCount: query.data?.count ?? 0,
    hasNext: Boolean(query.data?.next),
    hasPrevious: Boolean(query.data?.previous),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/** One post, for the edit screen. */
export function useBlog(id: string | number | undefined) {
  return useQuery({
    queryKey: [...BLOGS_KEY, 'detail', String(id)],
    queryFn: () => blogService.get(id as string | number),
    enabled: id !== undefined && id !== '',
    retry: false,
  });
}

/** Create, update, publish/unpublish and delete; each refreshes the listing. */
export function useBlogMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: BLOGS_KEY });
  const fail = (title: string) => (error: unknown) =>
    toast.error(title, { description: getErrorMessage(error) });

  const create = useMutation({
    mutationFn: (data: BlogFormData) => blogService.create(data),
    onSuccess: (post) => {
      toast.success(post.status === 'published' ? 'Post published' : 'Draft saved');
      void invalidate();
    },
    onError: fail('The post could not be created'),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<BlogFormData> }) =>
      blogService.update(id, data),
    onSuccess: () => {
      toast.success('Changes saved');
      void invalidate();
    },
    onError: fail('Your changes could not be saved'),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: BlogStatus }) =>
      blogService.setStatus(id, status),
    onSuccess: (post) => {
      toast.success(post.status === 'published' ? 'Post published' : 'Moved to drafts');
      void invalidate();
    },
    onError: fail('The status could not be changed'),
  });

  const remove = useMutation({
    mutationFn: (id: number | string) => blogService.remove(id),
    onSuccess: () => {
      toast.success('Post deleted');
      void invalidate();
    },
    onError: fail('The post could not be deleted'),
  });

  return {
    create: create.mutateAsync,
    update: (id: number | string, data: Partial<BlogFormData>) => update.mutateAsync({ id, data }),
    setStatus: (id: number | string, status: BlogStatus) => setStatus.mutateAsync({ id, status }),
    remove: remove.mutateAsync,
    isSaving: create.isPending || update.isPending,
    isBusy: setStatus.isPending || remove.isPending,
  };
}
