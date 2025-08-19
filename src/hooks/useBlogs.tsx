'use client';

import { useCallback, useEffect, useState } from 'react';
import { blogService } from '@/services/blog';
import { toast } from 'sonner';

import type { BlogFormData, BlogPost } from '@/types/blog';

export function useBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await blogService.seedIfEmpty();
      const list = await blogService.list();
      setBlogs(list);
    } catch (e) {
      setError('Failed to load blogs');
      toast.error('Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    async (id: string) => {
      await blogService.remove(id);
      toast.success('Blog deleted');
      await refresh();
    },
    [refresh]
  );

  const toggleVisibility = useCallback(
    async (id: string) => {
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

  const loadOne = useCallback(async (id: string) => {
    return blogService.get(id);
  }, []);

  return {
    blogs,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    toggleVisibility,
    loadOne,
  } as const;
}

export default useBlogs;
