'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImagePlus, Loader2, X } from 'lucide-react';

import { extractFieldErrors } from '@/lib/error-utils';
import { cn } from '@/lib/utils';
import type { BlogFormData, BlogPost, BlogStatus } from '@/types/blog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { buttonStyles, Panel, SkeletonBlock } from '@/components/parlezhub/ui';

const SUMMARY_MAX = 160;
const MAX_TAGS = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type Errors = Partial<Record<'title' | 'content' | 'meta_description' | 'thumbnail' | 'tags', string>>;

/**
 * Write or edit a blog post: title, summary, cover image, tags and a markdown
 * body with a live preview. Submitting picks the status — "Save as draft" or
 * "Publish" — so a consultant never has to find a separate status control.
 */
export function BlogComposer({
  initial,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  initial?: BlogPost;
  isSubmitting: boolean;
  /** Rejects with the API error so field errors can be shown inline. */
  onSubmit: (data: BlogFormData) => Promise<unknown>;
  onCancel: () => void;
}) {
  const ids = useId();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [summary, setSummary] = useState(initial?.meta_description ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.thumbnail ?? null);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [errors, setErrors] = useState<Errors>({});
  const [pendingStatus, setPendingStatus] = useState<BlogStatus | null>(null);

  // Revoke object URLs made for a picked file.
  useEffect(() => {
    if (!thumbnail) return;
    const url = URL.createObjectURL(thumbnail);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  const wasPublished = initial?.status === 'published';

  const submit = async (status: BlogStatus) => {
    const next: Errors = {};
    if (!title.trim()) next.title = 'Give your post a title.';
    if (!content.trim()) next.content = 'Write something before saving.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPendingStatus(status);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        meta_description: summary.trim(),
        tags,
        status,
        ...(thumbnail ? { thumbnail } : {}),
      });
    } catch (error) {
      setErrors(extractFieldErrors(error) as Errors);
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit('published');
      }}
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <Panel className="space-y-5">
        <Field id={`${ids}-title`} label="Title" error={errors.title}>
          <Input
            id={`${ids}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Five French phrases you will use every day"
            aria-invalid={Boolean(errors.title)}
            className="h-11 text-base"
          />
        </Field>

        <Field
          id={`${ids}-summary`}
          label="Summary"
          hint="Shown in listings and search results."
          error={errors.meta_description}
          counter={`${summary.length}/${SUMMARY_MAX}`}
        >
          <Textarea
            id={`${ids}-summary`}
            value={summary}
            onChange={(event) => setSummary(event.target.value.slice(0, SUMMARY_MAX))}
            rows={2}
            placeholder="One or two sentences about what readers will learn."
          />
        </Field>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-foreground" id={`${ids}-content-label`}>
              Content
            </span>
            <div className="flex gap-1 rounded-full border border-border bg-background p-1" role="tablist">
              {(['write', 'preview'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={cn(
                    'h-8 rounded-full px-3 text-xs font-semibold capitalize transition-colors',
                    tab === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          {tab === 'write' ? (
            <Textarea
              aria-labelledby={`${ids}-content-label`}
              aria-invalid={Boolean(errors.content)}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={'Write in Markdown.\n\n## A heading\n\nSome **bold** text, a [link](https://example.com) and a list:\n\n- one\n- two'}
              className="min-h-[24rem] font-mono text-sm leading-relaxed"
            />
          ) : (
            <div className="min-h-[24rem] rounded-md border border-input bg-background px-4 py-3">
              {content.trim() ? (
                <article className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/90 sm:prose-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </article>
              ) : (
                <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          )}
          <p className="flex justify-between gap-3 text-xs text-muted-foreground">
            {errors.content ? (
              <span className="font-medium text-destructive">{errors.content}</span>
            ) : (
              <span>Markdown is supported: headings, lists, links, bold and tables.</span>
            )}
            <span className="shrink-0">{wordCount(content)} words</span>
          </p>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Cover image</p>
          <CoverPicker
            preview={preview}
            error={errors.thumbnail}
            onPick={(file) => {
              if (file.size > MAX_IMAGE_BYTES) {
                setErrors((prev) => ({ ...prev, thumbnail: 'Choose an image under 5 MB.' }));
                return;
              }
              setErrors((prev) => ({ ...prev, thumbnail: undefined }));
              setThumbnail(file);
            }}
            onClear={
              thumbnail
                ? () => {
                    setThumbnail(null);
                    setPreview(initial?.thumbnail ?? null);
                  }
                : undefined
            }
          />
        </Panel>

        <Panel className="space-y-3">
          <p className="text-sm font-semibold text-foreground" id={`${ids}-tags-label`}>
            Tags
          </p>
          <TagEditor labelledBy={`${ids}-tags-label`} tags={tags} onChange={setTags} />
          {errors.tags && <p className="text-xs font-medium text-destructive">{errors.tags}</p>}
        </Panel>

        <Panel className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {wasPublished
              ? 'This post is live. Saving updates it for readers right away.'
              : 'Drafts are only visible to you until you publish.'}
          </p>
          <button type="submit" disabled={isSubmitting} className={buttonStyles.primary + ' w-full'}>
            {pendingStatus === 'published' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {wasPublished ? 'Save changes' : 'Publish'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submit('draft')}
            className={buttonStyles.secondary + ' w-full'}
          >
            {pendingStatus === 'draft' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {wasPublished ? 'Unpublish and save as draft' : 'Save as draft'}
          </button>
          <button type="button" disabled={isSubmitting} onClick={onCancel} className={buttonStyles.ghost + ' w-full'}>
            Cancel
          </button>
        </Panel>
      </div>
    </form>
  );
}

function wordCount(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function Field({
  id,
  label,
  hint,
  error,
  counter,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {(error || hint || counter) && (
        <p className="flex justify-between gap-3 text-xs text-muted-foreground">
          {error ? <span className="font-medium text-destructive">{error}</span> : <span>{hint}</span>}
          {counter && <span className="shrink-0">{counter}</span>}
        </p>
      )}
    </div>
  );
}

function CoverPicker({
  preview,
  error,
  onPick,
  onClear,
}: {
  preview: string | null;
  error?: string;
  onPick: (file: File) => void;
  onClear?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="group relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob or remote upload */}
            <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-foreground/60 py-1.5 text-xs font-semibold text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Replace image
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-xs font-semibold">
            <ImagePlus className="h-6 w-6 text-primary" aria-hidden="true" />
            Add a cover image
          </span>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          event.target.value = '';
        }}
      />
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        {error ? <span className="font-medium text-destructive">{error}</span> : <span>PNG, JPG or WebP, up to 5 MB.</span>}
        {onClear && (
          <button type="button" onClick={onClear} className="font-semibold text-primary hover:underline">
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

function TagEditor({
  tags,
  onChange,
  labelledBy,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  labelledBy: string;
}) {
  const [draft, setDraft] = useState('');
  const full = tags.length >= MAX_TAGS;

  const commit = () => {
    const additions = draft
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag, i, all) => all.indexOf(tag) === i)
      .filter((tag) => !tags.some((existing) => existing.toLowerCase() === tag.toLowerCase()));
    if (additions.length) onChange([...tags, ...additions].slice(0, MAX_TAGS));
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-labelledby={labelledBy}>
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-secondary py-0.5 pl-2.5 pr-1 text-xs font-semibold text-secondary-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                aria-label={`Remove tag ${tag}`}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-background"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        value={draft}
        disabled={full}
        aria-labelledby={labelledBy}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={full ? `Up to ${MAX_TAGS} tags` : 'Type a tag, press Enter'}
      />
    </div>
  );
}

export function BlogComposerSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]" aria-busy="true">
      <SkeletonBlock className="h-[36rem] rounded-2xl" />
      <div className="space-y-5">
        <SkeletonBlock className="h-56 rounded-2xl" />
        <SkeletonBlock className="h-28 rounded-2xl" />
        <SkeletonBlock className="h-44 rounded-2xl" />
      </div>
    </div>
  );
}
