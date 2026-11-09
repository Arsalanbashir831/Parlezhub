'use client';

import { Clock, MoreHorizontal, Pause, Pencil, Play, Trash2 } from 'lucide-react';

import type { Service } from '@/types/service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusPill } from '@/components/parlezhub/dashboard/widgets';
import { buttonStyles } from '@/components/parlezhub/ui';

/** One of the consultant's gigs, with its actions. */
export function GigRow({
  gig,
  onEdit,
  onToggleStatus,
  onDelete,
  disabled,
}: {
  gig: Service;
  onEdit: (gig: Service) => void;
  onToggleStatus: (gig: Service) => void;
  onDelete: (gig: Service) => void;
  disabled?: boolean;
}) {
  const live = gig.status === 'active';
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 truncate font-bold text-foreground">{gig.title}</h3>
          <StatusPill active={live} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{gig.shortDescription}</p>
        {gig.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {gig.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-left sm:text-right">
          <p className="text-lg font-extrabold text-foreground">${gig.price}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {gig.duration} min
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => onEdit(gig)} className={buttonStyles.secondary + ' h-9 px-4'}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              disabled={disabled}
              aria-label={`More actions for ${gig.title}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-50"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onSelect={() => onToggleStatus(gig)} className="gap-2">
                {live ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {live ? 'Pause gig' : 'Make live'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onDelete(gig)} className="gap-2 text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
