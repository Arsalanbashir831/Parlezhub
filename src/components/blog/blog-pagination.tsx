'use client';

import { Button } from '@/components/ui/button';

interface BlogPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (newPage: number) => void;
}

export function BlogPagination({
  currentPage,
  totalCount,
  pageSize,
  hasPrevious,
  hasNext,
  onPageChange,
}: BlogPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalCount <= pageSize) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
      <div className="text-center text-sm font-medium text-primary-100/40 sm:text-left">
        Showing <span className="text-primary-100">{Math.min(pageSize, totalCount)}</span> of{' '}
        <span className="text-primary-100">{totalCount}</span> blogs
        <span className="mx-2 opacity-20">|</span>
        Page <span className="text-primary-100">{currentPage}</span> of {totalPages}
      </div>
      <div className="flex justify-center gap-3 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-10 px-6 rounded-xl border-white/10 bg-white/5 text-primary-100 hover:bg-white/10 disabled:opacity-30 transition-all font-bold"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-10 px-6 rounded-xl border-white/10 bg-white/5 text-primary-100 hover:bg-white/10 disabled:opacity-30 transition-all font-bold"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
