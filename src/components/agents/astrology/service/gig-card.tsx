'use client';

import { useState } from 'react';
import { Check, ChevronDown, Clock, Pause, Pencil, Play, Star, Trash2 } from 'lucide-react';

import { Service } from '@/types/service';
import { getServiceTypeLabel } from '@/lib/service-utils';
import { cn } from '@/lib/utils';

interface GigCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onDelete: (service: Service) => void;
}

const TAG_PILL =
  'rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-muted-foreground';

/** One gig the way its owner needs to read it: the student-facing pitch first,
 *  the full description behind a toggle, then the three things you can do to it. */
export function GigCard({ service, onEdit, onToggleStatus, onDelete }: GigCardProps) {
  const [expanded, setExpanded] = useState(false);
  const live = service.status === 'active';
  const rating = service.averageRating ?? 0;
  const sessions = service.totalSessions ?? 0;

  return (
    <article className="obs-card flex min-w-0 flex-col gap-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="obs-chip" data-tone={live ? 'jade' : 'gold'}>{live ? 'Live' : 'Paused'}</span>
          <p className="obs-label">{getServiceTypeLabel(service.type)}</p>
        </div>
        <p className="flex shrink-0 items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight">${service.price}</span>
          <span className="obs-muted text-xs">/ {service.duration} min</span>
        </p>
      </div>

      <div className="min-w-0">
        <h3 className="text-lg font-medium leading-snug">{service.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.shortDescription}</p>
      </div>

      {service.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {service.tags.map(tag => <li key={tag} className={TAG_PILL}>{tag}</li>)}
        </ul>
      )}

      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{service.duration} min per session</li>
        <li>{sessions} {sessions === 1 ? 'session' : 'sessions'} booked</li>
        {rating > 0 && <li className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-current text-[var(--solar-gold)]" aria-hidden="true" />{rating.toFixed(1)} · {service.reviewCount ?? 0} reviews</li>}
      </ul>

      <button type="button" className="obs-control self-start gap-2 text-xs" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
        {expanded ? 'Hide the full description' : 'Read the full description'}
      </button>

      {expanded && (
        <div className="grid gap-5 border-t border-[var(--border-subtle)] pt-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
          {service.whatYouProvide.length > 0 && (
            <div>
              <p className="obs-label mb-2">What the student gets</p>
              <ul className="space-y-1.5">
                {service.whatYouProvide.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--solar-orange)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-4">
        <button type="button" className="obs-control gap-2 text-xs" onClick={() => onToggleStatus(service)}>
          {live ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {live ? 'Pause' : 'Activate'}
        </button>
        <button type="button" className="obs-control obs-accent gap-2 text-xs" onClick={() => onEdit(service)}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
        <button type="button" className="obs-control ml-auto w-11 gap-0 p-0 text-[var(--danger)]" aria-label={`Delete ${service.title}`} onClick={() => onDelete(service)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
