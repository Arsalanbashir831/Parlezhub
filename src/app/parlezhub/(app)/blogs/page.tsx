'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, FileText, PenSquare, Search } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useBlogList, useBlogMutations } from '@/hooks/useBlogs';
import { cn } from '@/lib/utils';
import type { BlogPost, BlogStatus } from '@/types/blog';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import {
  buttonStyles,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonBlock,
} from '@/components/parlezhub/ui';
import { BlogRow } from '@/components/parlezhub/blogs/blog-row';

const PAGE_SIZE = 10;

const FILTERS: { label: string; value: BlogStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
];

/** /parlezhub/blogs — the consultant's blog posts: list, search, publish, delete. */
export default function MyBlogsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BlogStatus | undefined>();
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search as the consultant types, without a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { blogs, totalCount, hasNext, hasPrevious, isLoading, isFetching, isError, refetch } =
    useBlogList({ page, page_size: PAGE_SIZE, status, search: search || undefined });
  const { setStatus: changeStatus, remove, isBusy } = useBlogMutations();

  const filtered = Boolean(search || status);
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Deleting the last post on a page leaves it empty; step back one.
  useEffect(() => {
    if (!isLoading && !isFetching && page > 1 && blogs.length === 0) setPage((p) => p - 1);
  }, [blogs.length, isLoading, isFetching, page]);

  const createLink = (
    <Link href={ROUTES.PARLEZHUB.CREATE_BLOG} className={buttonStyles.primary}>
      <PenSquare className="h-4 w-4" aria-hidden="true" />
      Write a post
    </Link>
  );

  const confirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await remove(deleting.id);
      setDeleting(null);
    } catch {
      // The hook has already shown the error; keep the dialog for a retry.
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = (post: BlogPost) =>
    void changeStatus(post.id, post.status === 'published' ? 'draft' : 'published').catch(() => undefined);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Blog"
        title="My posts"
        description="Share what you teach. Drafts stay private until you publish them."
        actions={createLink}
      />

      {isError && blogs.length === 0 ? (
        <ErrorState
          title="Your posts could not be loaded"
          body="Nothing has changed. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-11 rounded-full" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
      ) : totalCount === 0 && !filtered ? (
        <EmptyState
          icon={FileText}
          title="Write your first post"
          body="Tips, lessons and stories help learners get to know you before they book."
          action={createLink}
        />
      ) : (
        <section aria-label="Your posts" className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search posts</span>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by title or tag"
                className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              />
            </label>
            <div className="flex gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label="Filter by status">
              {FILTERS.map(({ label, value }) => {
                const active = status === value;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setStatus(value);
                      setPage(1);
                    }}
                    className={cn(
                      'h-9 flex-1 rounded-full px-4 text-sm font-semibold transition-colors sm:flex-none',
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {blogs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              No post matches this filter.{' '}
              <button type="button" className="font-semibold text-primary hover:underline" onClick={clearFilters}>
                Clear it
              </button>
            </p>
          ) : (
            <div className={cn('space-y-3 transition-opacity', isFetching && 'opacity-60')}>
              {blogs.map((post) => (
                <BlogRow
                  key={post.id}
                  post={post}
                  disabled={isBusy}
                  onEdit={(target) => router.push(ROUTES.PARLEZHUB.EDIT_BLOG(target.id))}
                  onToggleStatus={toggleStatus}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          )}

          {(hasNext || hasPrevious) && (
            <nav aria-label="Pages" className="flex items-center justify-between gap-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pageCount} · {totalCount} posts
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!hasPrevious || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                  className={buttonStyles.secondary + ' h-9 px-3'}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!hasNext || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className={buttonStyles.secondary + ' h-9 px-3'}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </section>
      )}

      <ConfirmationDialog
        isOpen={Boolean(deleting)}
        onClose={() => {
          if (!isDeleting) setDeleting(null);
        }}
        title="Delete this post?"
        description={`“${deleting?.title ?? 'This post'}” will be removed for good. Moving it to drafts instead keeps it for later.`}
        confirmText="Delete post"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
