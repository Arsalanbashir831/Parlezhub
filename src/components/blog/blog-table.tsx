'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Edit,
  Eye,
  FileText,
  Globe,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import { BlogPost } from '@/types/blog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BlogTableProps {
  blogs: BlogPost[];
  isLoading: boolean;
  onDelete: (id: number, title: string) => void;
  onToggleVisibility: (id: number) => Promise<BlogPost | null>;
  formatDate: (dateString: string) => string;
}

export function BlogTable({
  blogs,
  isLoading,
  onDelete,
  onToggleVisibility,
  formatDate,
}: BlogTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md">
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-primary-100/60">Loading blogs...</div>
        </CardContent>
      </Card>
    );
  }

  if (blogs.length === 0) {
    return (
      <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-2 text-primary-100/60">No blogs found</div>
          <p className="mb-4 text-sm text-primary-100/40">
            Try adjusting your filters or search query.
          </p>
          <Link href={ROUTES.TEACHER.CREATE_BLOG}>
            <Button className="h-10 rounded-xl bg-primary-500 font-bold text-white hover:bg-primary-600">
              Create Your First Blog
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-white/5">
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead className="w-12"></TableHead>
                <TableHead className="md:min-w-[200px] text-primary-100/60 font-bold uppercase tracking-widest text-[10px]">Title</TableHead>
                <TableHead className="hidden sm:table-cell text-primary-100/60 font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="hidden md:table-cell text-primary-100/60 font-bold uppercase tracking-widest text-[10px]">Tags</TableHead>
                <TableHead className="hidden lg:table-cell text-primary-100/60 font-bold uppercase tracking-widest text-[10px]">Views</TableHead>
                <TableHead className="hidden lg:table-cell text-primary-100/60 font-bold uppercase tracking-widest text-[10px]">Read Time</TableHead>
                <TableHead className="hidden sm:table-cell text-primary-100/60 font-bold uppercase tracking-widest text-[10px]">Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id} className="border-white/5 hover:bg-white/5">
                  {/* Thumbnail */}
                  <TableCell className="p-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {blog.thumbnail ? (
                        <Image
                          src={blog.thumbnail}
                          alt={blog.title}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText className="h-6 w-6 text-primary-100/20" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Title */}
                  <TableCell className="px-4 md:min-w-[200px]">
                    <div className="space-y-1">
                      <div className="line-clamp-1 text-sm font-bold text-primary-100">
                        {blog.title}
                      </div>
                      {blog.meta_description && (
                        <div className="line-clamp-1 max-w-48 text-xs text-primary-100/40">
                          {blog.meta_description}
                        </div>
                      )}
                      {/* Mobile-only status and stats */}
                      <div className="flex items-center gap-2 sm:hidden">
                        <Badge
                          variant={blog.is_published ? 'default' : 'secondary'}
                          className={`px-2 text-[10px] font-bold uppercase tracking-tighter ${
                            blog.is_published ? 'bg-primary-500/20 text-primary-500 border-primary-500/20' : 'bg-white/5 text-primary-100/40 border-white/5'
                          }`}
                        >
                          {blog.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-primary-100/40">
                          <Eye className="h-3 w-3" />
                          {blog.view_count}
                        </div>
                        <div className="text-[10px] text-primary-100/40">
                          {blog.read_time}min
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="hidden sm:table-cell p-4">
                    <Badge
                      variant={blog.is_published ? 'default' : 'secondary'}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        blog.is_published ? 'bg-primary-500/20 text-primary-500 border-primary-500/20' : 'bg-white/5 text-primary-100/40 border-white/5'
                      }`}
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>

                  {/* Tags */}
                  <TableCell className="hidden md:table-cell p-4">
                    <div className="flex max-w-32 flex-wrap gap-1">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-white/10 bg-white/5 text-[10px] font-medium text-primary-100/60"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 2 && (
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] font-medium text-primary-100/60">
                          +{blog.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Views */}
                  <TableCell className="hidden lg:table-cell p-4 text-primary-100/60">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary-500/60" />
                      <span className="text-sm font-medium">{blog.view_count}</span>
                    </div>
                  </TableCell>

                  {/* Read Time */}
                  <TableCell className="hidden lg:table-cell p-4 text-sm font-medium text-primary-100/60">
                    {blog.read_time} min
                  </TableCell>

                  {/* Updated */}
                  <TableCell className="hidden p-4 text-sm font-medium text-primary-100/40 sm:table-cell">
                    {formatDate(blog.updated_at)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="p-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 rounded-xl hover:bg-white/5 text-primary-100/60"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 rounded-2xl border-white/10 bg-background/95 p-2 shadow-2xl backdrop-blur-md" align="end">
                        <div className="space-y-1">
                          <Link href={ROUTES.TEACHER.EDIT_BLOG(blog.id.toString())}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start rounded-xl hover:bg-white/5 text-primary-100/80"
                            >
                              <Edit className="mr-3 h-4 w-4 text-primary-500/60" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start rounded-xl hover:bg-white/5 text-primary-100/80"
                            onClick={() => void onToggleVisibility(blog.id)}
                          >
                            {blog.is_published ? (
                              <>
                                <FileText className="mr-3 h-4 w-4 text-primary-500/60" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Globe className="mr-3 h-4 w-4 text-primary-500/60" />
                                Publish
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(blog.id, blog.title)}
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}
