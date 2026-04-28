'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ExternalLink, Search, Star } from 'lucide-react';

import { SharedStudentAccess } from '@/types/astrology';
import { useConsultantSharedStudents } from '@/hooks/useAstrology';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';

export function SharedStudentsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useConsultantSharedStudents({
    search: debouncedSearch,
    page: page,
    page_size: pageSize,
  });

  const students = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1); // Reset to first page when changing page size
  };

  // If no data and not loading, show empty state
  if (!isLoading && (!data || (totalCount === 0 && !debouncedSearch))) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <div className="rounded-full bg-primary-500/10 p-6">
          <Star className="h-12 w-12 text-primary-500/40" />
        </div>
        <h3 className="mt-6 font-serif text-2xl font-bold text-white">No Shared Access Yet</h3>
        <p className="mt-2 max-w-sm text-primary-100/60">
          When students grant you access to their astrological charts, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500/40" />
          <Input
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-12 rounded-xl border-white/5 bg-white/5 pl-11 text-white placeholder:text-primary-100/20 focus:ring-primary-500/30"
          />
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <Badge variant="outline" className="h-10 rounded-xl border-primary-500/20 bg-primary-500/5 px-4 font-serif text-sm font-bold text-primary-500">
              {totalCount} Students Found
            </Badge>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
          <p className="font-serif text-lg font-bold text-primary-100/60">Loading students...</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((record: SharedStudentAccess) => (
              <div
                key={record.id}
                className="group relative flex flex-col items-start p-6 rounded-3xl border border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.06] hover:shadow-primary-500/10 hover:-translate-y-1"
              >
                <div className="flex w-full items-start justify-between">
                  <Avatar className="h-16 w-16 border-2 border-primary-500/10 transition-colors group-hover:border-primary-500">
                    <AvatarImage src={record.student.profile_picture || ''} />
                    <AvatarFallback className="font-serif text-xl font-bold bg-primary-500/20 text-primary-500">
                      {(record.student.full_name || 'S')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="mt-4 space-y-1 w-full">
                  <h3 className="truncate font-serif text-lg font-bold text-white group-hover:text-primary-500 transition-colors">
                    {record.student.full_name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                    <Star className="h-3 w-3 fill-primary-500/40 text-primary-500/40" />
                    Granted {new Date(record.granted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-6 flex w-full items-center gap-3">
                  <Button
                    asChild
                    className="flex-1 rounded-xl bg-primary-500 font-bold text-primary-950 transition-all hover:bg-primary-400"
                  >
                    <Link href={`${ROUTES.AGENT.ASTROLOGY}?student_id=${record.student.id}`}>
                      View Chart
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {students.length === 0 && debouncedSearch && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <p className="font-serif text-xl font-bold text-primary-100/40">No students match your search.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex flex-col items-center justify-center gap-6 pt-8 sm:flex-row">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevious}
                  className="rounded-xl border-white/5 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="font-serif text-sm font-bold text-primary-100/60">
                  Page {page} {totalPages > 0 && `of ${totalPages}`}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="rounded-xl border-white/5 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-primary-100/40">Show:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-10 w-20 rounded-xl border-white/5 bg-white/5 text-white focus:ring-primary-500/30">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-[#0A0A0A] text-white">
                    {[10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()} className="focus:bg-primary-500 focus:text-primary-950">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
