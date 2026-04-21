'use client';

import { Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BlogFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'draft' | 'published';
  setStatusFilter: (status: 'all' | 'draft' | 'published') => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export function BlogFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  pageSize,
  setPageSize,
}: BlogFiltersProps) {
  return (
    <Card className="rounded-2xl border-white/5 bg-white/[0.03] shadow-xl backdrop-blur-md">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-primary-500/60" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-white/[0.03] pl-12 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
          </div>

          <div className="flex gap-2">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'draft' | 'published') =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="h-12 w-36 rounded-xl border-white/10 bg-white/[0.03] font-bold text-primary-100 focus:ring-primary-500/30 sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="border-primary-500/10 bg-background text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            {/* Page Size */}
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-12 w-20 rounded-xl border-white/10 bg-white/[0.03] font-bold text-primary-100 focus:ring-primary-500/30 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-primary-500/10 bg-background text-white">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
