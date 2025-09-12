'use client';

import { useCallback, useEffect, useState } from 'react';
import { blogService } from '@/services/blog';
import { toast } from 'sonner';

import type { BlogFormData, BlogPost } from '@/types/blog';

export function useBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const refresh = useCallback(
    async (params?: {
      page?: number;
      page_size?: number;
      status?: 'draft' | 'published';
      search?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await blogService.list(params);
        setBlogs(response.results);
        setTotalCount(response.count);
        setHasNext(!!response.next);
        setHasPrevious(!!response.previous);
        if (params?.page) {
          setCurrentPage(params.page);
        }
      } catch {
        setError('Failed to load blogs');
        toast.error('Failed to load blogs');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: BlogFormData) => {
      const created = await blogService.create(data);
      toast.success('Blog created');
      await refresh();
      return created;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, data: Partial<BlogFormData>) => {
      const updated = await blogService.update(id, data);
      toast.success('Blog updated');
      await refresh();
      return updated;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string | number) => {
      await blogService.remove(id);
      toast.success('Blog deleted');
      await refresh();
    },
    [refresh]
  );

  const toggleVisibility = useCallback(
    async (id: string | number) => {
      const current = (await blogService.get(id))?.status;
      const next = current === 'published' ? 'draft' : 'published';
      const updated = await blogService.setStatus(
        id,
        next as 'draft' | 'published'
      );
      toast.success(
        updated?.status === 'published' ? 'Blog published' : 'Saved as draft'
      );
      await refresh();
      return updated;
    },
    [refresh]
  );

  const loadOne = useCallback(async (id: string | number) => {
    return blogService.get(id);
  }, []);

  return {
    blogs,
    isLoading,
    error,
    totalCount,
    currentPage,
    hasNext,
    hasPrevious,
    refresh,
    create,
    update,
    remove,
    toggleVisibility,
    loadOne,
  } as const;
}

export default useBlogs;
