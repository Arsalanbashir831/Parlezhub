'use client';

import { Eye, FileText, MoreHorizontal, Pencil, Send, Trash2, Undo2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buttonStyles } from '@/components/parlezhub/ui';

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export function BlogStatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        published ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary text-muted-foreground'
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', published ? 'bg-emerald-500' : 'bg-muted-foreground')}
        aria-hidden="true"
      />
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

/** One of the consultant's posts, with its actions. */
export function BlogRow({
  post,
  onEdit,
  onToggleStatus,
  onDelete,
  disabled,
}: {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onToggleStatus: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
  disabled?: boolean;
}) {
  const published = post.status === 'published';
  const date = new Date(published && post.published_at ? post.published_at : post.updated_at);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary sm:block">
          {post.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote upload, any host
            <img src={post.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-primary/60">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate font-bold text-foreground">{post.title}</h3>
            <BlogStatusPill published={published} />
          </div>
          {post.meta_description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.meta_description}</p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              {published ? 'Published' : 'Edited'} {Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)}
            </span>
            {post.read_time > 0 && <span>{post.read_time} min read</span>}
            {published && (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {post.view_count} {post.view_count === 1 ? 'view' : 'views'}
              </span>
            )}
          </p>
          {post.tags?.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:ml-auto">
        <button type="button" onClick={() => onEdit(post)} className={buttonStyles.secondary + ' h-9 px-4'}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            disabled={disabled}
            aria-label={`More actions for ${post.title}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onSelect={() => onToggleStatus(post)} className="gap-2">
              {published ? <Undo2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {published ? 'Move to drafts' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(post)}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
