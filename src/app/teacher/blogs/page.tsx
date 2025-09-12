'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Edit,
  Eye,
  FileText,
  Globe,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useBlogs } from '@/hooks/useBlogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function BlogsPage() {
  const {
    blogs,
    isLoading,
    totalCount,
    currentPage,
    hasNext,
    hasPrevious,
    refresh,
    remove,
    toggleVisibility,
  } = useBlogs();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'published'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Apply filters
  useEffect(() => {
    const params: {
      page?: number;
      page_size?: number;
      status?: 'draft' | 'published';
      search?: string;
    } = {
      page: 1,
      page_size: pageSize,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    refresh(params);
  }, [statusFilter, searchQuery, pageSize, refresh]);

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
        onClick: () => {},
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    const params: {
      page?: number;
      page_size?: number;
      status?: 'draft' | 'published';
      search?: string;
    } = {
      page: newPage,
      page_size: pageSize,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    refresh(params);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage your blog posts.
          </p>
        </div>
        <Link href={ROUTES.TEACHER.CREATE_BLOG}>
          <Button>Create New Blog</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
                <SelectTrigger className="w-36 sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger className="w-20 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Showing {blogs.length} of {totalCount} blogs
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-gray-500">Loading blogs...</div>
            </div>
          ) : blogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="md:min-w-[200px]">Title</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Tags</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Views
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Read Time
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Updated
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog.id}>
                      {/* Thumbnail */}
                      <TableCell className="p-2">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {blog.thumbnail ? (
                            <Image
                              src={blog.thumbnail}
                              alt={blog.title}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Title */}
                      <TableCell className="px-2 md:min-w-[200px]">
                        <div className="space-y-1">
                          <div className="line-clamp-1 text-sm font-medium">
                            {blog.title}
                          </div>
                          {blog.meta_description && (
                            <div className="line-clamp-1 max-w-48 text-xs text-gray-500">
                              {blog.meta_description}
                            </div>
                          )}
                          {/* Mobile-only status and stats */}
                          <div className="flex items-center gap-2 sm:hidden">
                            <Badge
                              variant={
                                blog.is_published ? 'default' : 'secondary'
                              }
                              className="px-0 text-xs"
                            >
                              {blog.status}
                            </Badge>
                            <div className="flex hidden items-center gap-1 text-xs text-gray-500 md:flex">
                              <Eye className="h-3 w-3" />
                              {blog.view_count}
                            </div>
                            <div className="text-xs text-gray-500">
                              {blog.read_time}min
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status - Hidden on mobile */}
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={blog.is_published ? 'default' : 'secondary'}
                        >
                          {blog.status}
                        </Badge>
                      </TableCell>

                      {/* Tags - Hidden on mobile/small tablets */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex max-w-32 flex-wrap gap-1">
                          {blog.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{blog.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Views - Hidden on mobile/tablets */}
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-gray-400" />
                          {blog.view_count}
                        </div>
                      </TableCell>

                      {/* Read Time - Hidden on mobile/tablets */}
                      <TableCell className="hidden lg:table-cell">
                        {blog.read_time} min
                      </TableCell>

                      {/* Updated - Hidden on mobile */}
                      <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                        {formatDate(blog.updated_at)}
                      </TableCell>

                      {/* Actions Popover */}
                      <TableCell className="p-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48" align="end">
                            <div className="space-y-1">
                              <Link
                                href={ROUTES.TEACHER.EDIT_BLOG(
                                  blog.id.toString()
                                )}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => void toggleVisibility(blog.id)}
                              >
                                {blog.is_published ? (
                                  <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Globe className="mr-2 h-4 w-4" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleDelete(blog.id, blog.title)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-2 text-gray-500">No blogs found</div>
              <p className="mb-4 text-sm text-gray-400">
                {statusFilter !== 'all' || searchQuery
                  ? 'Try adjusting your filters or search query.'
                  : 'Create your first blog post to get started.'}
              </p>
              {statusFilter === 'all' && !searchQuery && (
                <Link href={ROUTES.TEACHER.CREATE_BLOG}>
                  <Button>Create New Blog</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center text-sm text-gray-600 sm:text-left">
            Page {currentPage} of {Math.ceil(totalCount / pageSize)}
          </div>
          <div className="flex justify-center gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrevious}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
