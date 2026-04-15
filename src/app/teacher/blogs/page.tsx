'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

import { useBlogs } from '@/hooks/useBlogs';
import { BlogFilters, BlogPagination, BlogTable } from '@/components/blog';
import { Button } from '@/components/ui/button';

export default function BlogsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      page_size: pageSize,
    };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [currentPage, pageSize, statusFilter, searchQuery]);

  const {
    blogs,
    isLoading,
    totalCount,
    hasNext,
    hasPrevious,
    remove,
    toggleVisibility,
  } = useBlogs(queryParams);

  const handleDelete = (id: number, title: string) => {
    toast('Are you sure you want to delete this blog?', {
      description: `"${title}" will be permanently deleted.`,
      action: {
        label: 'Delete',
        onClick: () => {
          remove(id);
        },
      },
      cancel: { 
        label: 'Cancel',
        onClick: () => {} 
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
            My <span className="text-primary-500">Blogs</span>
          </h1>
          <p className="mt-2 text-primary-100/60 font-medium">
            Craft your stories and share your expert insights with the world.
          </p>
        </div>
        <Link href={ROUTES.TEACHER.CREATE_BLOG}>
          <Button className="h-12 rounded-2xl bg-primary-500 px-8 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary-600 active:scale-95">
            Create New Blog
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <BlogFilters
        searchQuery={searchQuery}
        setSearchQuery={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        statusFilter={statusFilter}
        setStatusFilter={(s) => { setStatusFilter(s); setCurrentPage(1); }}
        pageSize={pageSize}
        setPageSize={(s) => { setPageSize(s); setCurrentPage(1); }}
      />

      {/* Table */}
      <BlogTable
        blogs={blogs}
        isLoading={isLoading}
        onDelete={handleDelete}
        onToggleVisibility={toggleVisibility}
        formatDate={formatDate}
      />

      {/* Pagination */}
      <BlogPagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
