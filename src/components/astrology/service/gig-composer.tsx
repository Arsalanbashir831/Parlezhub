'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Plus, Sparkles, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ServiceFormData, ServiceType } from '@/types/service';
import {
  DURATION_CHOICES,
  TAG_SUGGESTIONS,
  TITLE_PLACEHOLDERS,
  gigFormSchema,
  getServiceTypeLabel,
  type GigFormValues,
} from '@/lib/service-utils';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/astrology/ui/observatory-state';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface GigComposerProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ServiceFormData>;
  availableTypes?: ServiceType[];
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const FIELD = 'w-full';

/** A section of the composer: what it is, why it matters, then its fields. */
function Section({ step, title, note, children }: { step: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="obs-card min-w-0 space-y-5 p-5 sm:p-6">
      <header>
        <p className="obs-label">{step}</p>
        <h2 className="mt-2 text-lg font-medium">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{note}</p>
      </header>
      {children}
    </section>
  );
}

function FieldLabel({ children, count, id }: { children: React.ReactNode; count?: string; id?: string }) {
  return (
    <span className="flex flex-wrap items-baseline justify-between gap-2">
      <span className="obs-label" id={id}>{children}</span>
      {count && <span className="text-xs text-muted-foreground">{count}</span>}
    </span>
  );
}

function FieldError({ message, fallback }: { message?: string; fallback: string }) {
  return <span className={cn('block text-xs', message ? 'text-[var(--danger)]' : 'text-muted-foreground')}>{message ?? fallback}</span>;
}

/** The gig exactly as a student reads it, built from whatever is typed so far. */
export function GigPreviewCard({ values }: { values: GigFormValues }) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-2">
      <p className="obs-label">How a student sees it</p>
      <article className="obs-card flex min-w-0 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="obs-chip" data-tone="gold">{getServiceTypeLabel(values.type)}</span>
          <p className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight">${values.price || 0}</span>
            <span className="obs-muted text-xs">/ {values.duration || 0} min</span>
          </p>
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-medium leading-snug">{values.title.trim() || 'Your gig title'}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {values.shortDescription.trim() || 'The one-line summary students read before opening your gig.'}
          </p>
        </div>
        {values.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {values.tags.map(tag => (
              <li key={tag} className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-muted-foreground">{tag}</li>
            ))}
          </ul>
        )}
        {values.whatYouProvide.length > 0 && (
          <ul className="space-y-1.5 border-t border-[var(--border-subtle)] pt-4">
            {values.whatYouProvide.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--solar-orange)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </article>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Publishing puts this gig on your profile, and its booking card into any chat a student opens with you.
      </p>
    </aside>
  );
}

/** The composer's own shape while a gig loads, so the page does not jump. */
export function GigComposerSkeleton() {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]" aria-hidden="true">
      <div className="flex min-w-0 flex-col gap-5">
        {[0, 1].map(index => (
          <div key={index} className="obs-card space-y-4 p-5 sm:p-6">
            <Skeleton className="h-4 w-24" rounded="rounded-md" />
            <Skeleton className="h-6 w-56 max-w-full" rounded="rounded-md" />
            <Skeleton className="h-10 w-full" rounded="rounded-xl" />
            <Skeleton className="h-10 w-2/3 max-w-full" rounded="rounded-xl" />
          </div>
        ))}
      </div>
      <div className="obs-card space-y-4 p-5 sm:p-6">
        <Skeleton className="h-5 w-28" rounded="rounded-md" />
        <Skeleton className="h-6 w-40 max-w-full" rounded="rounded-md" />
        <Skeleton className="h-16 w-full" rounded="rounded-xl" />
      </div>
    </div>
  );
}

export default function GigComposer({
  mode,
  initialData,
  // New gigs are astrology readings only; editing passes the gig's own type.
  availableTypes = ['astrology'],
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
}: GigComposerProps) {
  const [newTag, setNewTag] = useState('');
  const [newItem, setNewItem] = useState('');
  const { isGenerating, generateContent } = useAIGeneration();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      price: 60,
      duration: 60,
      tags: [],
      whatYouProvide: [],
      ...initialData,
      // Last, so an unavailable type can never be the default.
      type: initialData?.type ?? availableTypes[0],
    },
  });

  const values = watch();

  const pushTag = (tag: string) => {
    if (!tag) return;
    if (getValues('tags').includes(tag)) return;
    if (getValues('tags').length >= 5) {
      toast.error('Five tags is the limit — the strongest five are what students scan.');
      return;
    }
    setValue('tags', [...getValues('tags'), tag], { shouldValidate: true });
  };

  const addTag = () => {
    pushTag(newTag.trim());
    setNewTag('');
  };

  const removeTag = (tag: string) =>
    setValue('tags', getValues('tags').filter(item => item !== tag), { shouldValidate: true });

  const addItem = () => {
    const item = newItem.trim();
    if (!item) return;
    if (values.whatYouProvide.includes(item)) {
      setNewItem('');
      return;
    }
    if (values.whatYouProvide.length >= 10) {
      toast.error('Ten items is the limit — keep it to what the session actually covers.');
      return;
    }
    setValue('whatYouProvide', [...getValues('whatYouProvide'), item], { shouldValidate: true });
    setNewItem('');
  };

  const removeItem = (index: number) =>
    setValue('whatYouProvide', getValues('whatYouProvide').filter((_, i) => i !== index), { shouldValidate: true });

  const generateDescription = async () => {
    const title = values.title.trim();
    const shortDescription = values.shortDescription.trim();
    if (!title || !shortDescription) {
      toast.error('Write the title and the one-line summary first — the description is built from them.');
      return;
    }
    try {
      const { content, error: generationError } = await generateContent({
        type: 'service',
        title,
        shortDescription,
        serviceType: values.type,
        maxLength: 1200,
      });
      if (content) {
        setValue('description', content, { shouldValidate: true });
        toast.success('Description drafted. Read it, then make it yours.');
      } else if (generationError) {
        toast.error(generationError);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate the description.');
    }
  };

  const suggestedTags = TAG_SUGGESTIONS[values.type].filter(tag => !values.tags.includes(tag));

  return (
    <form onSubmit={handleSubmit(data => onSubmit(data as ServiceFormData))} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
      <div className="flex min-w-0 flex-col gap-5">
        {error && (
          <p role="alert" className="obs-card border-[var(--danger)] p-4 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <Section step="01 · The offer" title="What a student is booking" note="The title and the summary are what somebody compares you against before they read a word of the description.">
          <div className="space-y-2">
            <span className="obs-label">Type of session</span>
            {availableTypes.length === 1 ? (
              // One type on offer: show it as settled rather than as a choice.
              <p className="flex">
                <span data-selected="true" className="obs-control pointer-events-none gap-2 text-xs">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {getServiceTypeLabel(values.type)}
                </span>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Type of session">
                {availableTypes.map(type => (
                  <button key={type} type="button" className="obs-control text-xs" aria-pressed={values.type === type} onClick={() => setValue('type', type, { shouldValidate: true })}>
                    {getServiceTypeLabel(type)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block space-y-2">
            <FieldLabel count={`${values.title.length}/80`}>Gig title</FieldLabel>
            <Input {...register('title')} placeholder={TITLE_PLACEHOLDERS[values.type]} className={FIELD} />
            <FieldError message={errors.title?.message} fallback="One sentence, in the student’s terms." />
          </label>

          <label className="block space-y-2">
            <FieldLabel count={`${values.shortDescription.length}/160`}>One-line summary</FieldLabel>
            <Textarea {...register('shortDescription')} rows={2} placeholder="A 60-minute read of your natal chart, with the next five years mapped." className={FIELD} />
            <FieldError message={errors.shortDescription?.message} fallback="Shows on your profile and in the booking card." />
          </label>
        </Section>

        <Section step="02 · The session" title="What actually happens" note="Say how the session runs and what the student leaves with. Specific beats vague — this is where a booking is won.">
          <div className="space-y-2">
            <FieldLabel id="gig-description-label" count={`${values.description.length}/1200`}>Full description</FieldLabel>
            <Textarea {...register('description')} rows={7} aria-labelledby="gig-description-label" placeholder="How you prepare, what you cover, what you send afterwards." className={FIELD} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FieldError message={errors.description?.message} fallback="At least 100 characters." />
              <button type="button" className="obs-control gap-2 text-xs" onClick={generateDescription} disabled={isGenerating}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {isGenerating ? 'Drafting…' : 'Draft with the AI astrologer'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel count={`${values.whatYouProvide.length}/10`}>What the student gets</FieldLabel>
            {errors.whatYouProvide && <FieldError message={errors.whatYouProvide.message} fallback="" />}
            {values.whatYouProvide.length > 0 && (
              <ul className="space-y-2">
                {values.whatYouProvide.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[var(--solar-orange)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-sm">{item}</span>
                    <button type="button" className="text-muted-foreground hover:text-[var(--danger)]" aria-label={`Remove ${item}`} onClick={() => removeItem(index)}>
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input value={newItem} onChange={event => setNewItem(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addItem(); } }} placeholder="Written summary of the reading" aria-label="New item the student gets" className={FIELD} />
              <button type="button" className="obs-control shrink-0 gap-2 text-xs" onClick={addItem}><Plus className="h-4 w-4" aria-hidden="true" />Add item</button>
            </div>
          </div>
        </Section>

        <Section step="03 · Price and length" title="What it costs and how long it takes" note="One session, one price. Students filter on both, so keep them honest.">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <FieldLabel>Price per session</FieldLabel>
              <span className="relative block">
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input {...register('price', { valueAsNumber: true })} type="number" min={5} max={1000} step={5} aria-label="Price per session" className="pl-8" />
              </span>
              <FieldError message={errors.price?.message} fallback="Between $5 and $1000." />
            </label>

            <div className="space-y-2">
              <FieldLabel>Length in minutes</FieldLabel>
              <Input {...register('duration', { valueAsNumber: true })} type="number" min={15} max={300} step={5} aria-label="Length in minutes" className={FIELD} />
              <div className="flex flex-wrap gap-2">
                {DURATION_CHOICES.map(minutes => (
                  <button key={minutes} type="button" className="obs-control text-xs" aria-pressed={values.duration === minutes} onClick={() => setValue('duration', minutes, { shouldValidate: true })}>
                    {minutes} min
                  </button>
                ))}
              </div>
              <FieldError message={errors.duration?.message} fallback="15 minutes to 5 hours." />
            </div>
          </div>
        </Section>

        <Section step="04 · Findability" title="Tags students search for" note="Up to five. These are the words a student types before they find you." >
          <div className="space-y-3">
            {values.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {values.tags.map(tag => (
                  <li key={tag} className="obs-chip gap-2">
                    {tag}
                    <button type="button" aria-label={`Remove ${tag}`} className="opacity-70 hover:opacity-100" onClick={() => removeTag(tag)}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.tags && <FieldError message={errors.tags.message} fallback="" />}
            <div className="flex gap-2">
              <Input value={newTag} onChange={event => setNewTag(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} placeholder="Add a tag and press Enter" aria-label="New tag" className={FIELD} />
              <button type="button" className="obs-control shrink-0 gap-2 text-xs" onClick={addTag}><Plus className="h-4 w-4" aria-hidden="true" />Add tag</button>
            </div>
            {suggestedTags.length > 0 && (
              <>
                <p className="obs-label">{values.tags.length}/5 · tap to use</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <button key={tag} type="button" className="obs-control text-xs" onClick={() => pushTag(tag)} disabled={values.tags.length >= 5}>
                      + {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="obs-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : mode === 'create' ? 'Publish gig' : 'Save changes'}
          </button>
          <button type="button" className="obs-control" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <GigPreviewCard values={values} />
    </form>
  );
}
