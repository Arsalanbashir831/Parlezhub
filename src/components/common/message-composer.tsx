'use client';

import { KeyboardEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowUp,
  FileText,
  Loader2,
  Music,
  Paperclip,
  Video,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  inputClassName?: string;
  placeholder?: string;
  draftFiles?: File[];
  onAddFiles?: (files: FileList | File[]) => void;
  onRemoveFile?: (index: number) => void;
  onTyping?: () => void;
  isSending?: boolean;
}

const MessageComposer = memo(
  ({
    value,
    onChange,
    onSend,
    disabled = false,
    inputClassName,
    placeholder = 'Write a message…',
    draftFiles = [],
    onAddFiles,
    onRemoveFile,
    onTyping,
    isSending = false,
  }: MessageComposerProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

    const hasContent = value.trim().length > 0 || draftFiles.length > 0;

    // Create and cleanup object URLs for image files to prevent memory leaks
    useEffect(() => {
      const newPreviews: Record<string, string> = {};
      draftFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          newPreviews[file.name] = URL.createObjectURL(file);
        }
      });
      setImagePreviews(newPreviews);

      return () => {
        Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
      };
    }, [draftFiles]);

    const autoResize = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(Math.max(textarea.scrollHeight, 36), 128);
        textarea.style.height = `${newHeight}px`;
      }
    }, []);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (
          e.key === 'Enter' &&
          !e.shiftKey &&
          !e.nativeEvent.isComposing &&
          !disabled &&
          !isSending &&
          hasContent
        ) {
          e.preventDefault();
          onSend();
        }
      },
      [onSend, disabled, isSending, hasContent]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        if (e.target.value.trim()) onTyping?.();
        setTimeout(autoResize, 0);
      },
      [onChange, autoResize, onTyping]
    );

    useEffect(() => {
      autoResize();
    }, [value, autoResize]);

    return (
      <div className="flex w-full flex-col gap-3">
        {/* Horizontal draft attachment strip */}
        {draftFiles.length > 0 && (
          <div className="no-scrollbar flex max-w-full items-center gap-2.5 overflow-x-auto pb-1">
            {draftFiles.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');
              const isAudio = file.type.startsWith('audio/');

              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative flex h-16 shrink-0 items-center gap-2.5 rounded-xl border border-border bg-secondary p-2"
                  style={{ minWidth: isImage ? '64px' : '150px', maxWidth: '200px' }}
                >
                  {isImage ? (
                    imagePreviews[file.name] ? (
                      <Image
                        src={imagePreviews[file.name]}
                        alt={file.name}
                        width={100}
                        height={100}
                        className="h-full w-full rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-ember/10 text-ember">
                        <FileText className="h-4 w-4" />
                      </div>
                    )
                  ) : (
                    <>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-ember/10 text-ember">
                        {isVideo ? (
                          <Video className="h-4 w-4" />
                        ) : isAudio ? (
                          <Music className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-xs font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </>
                  )}

                  {!isSending && onRemoveFile && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(idx)}
                      aria-label={`Remove ${file.name}`}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Composer row */}
        <div className="obs-composer w-full">
          {onAddFiles && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    onAddFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xlsx"
                className="hidden"
                disabled={isSending || disabled}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || disabled}
                aria-label="Attach files"
                className="flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            </>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            aria-label="Message"
            placeholder={isSending ? 'Sending…' : placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSending || disabled}
            className={cn(
              'min-h-9 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground outline-none caret-[color:var(--solar-orange)] placeholder:text-muted-foreground disabled:opacity-50',
              inputClassName
            )}
            style={{ height: '36px' }}
          />
          <button
            type="button"
            onClick={onSend}
            aria-label="Send message"
            disabled={isSending || disabled || !hasContent}
            className={cn(
              'flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-full transition-[background-color,transform] active:scale-95',
              // An empty draft gets a recessed pill rather than a 50%-opacity
              // ember one: the arrow was unreadable against its own wash.
              hasContent || isSending
                ? 'bg-[color:var(--solar-orange)] text-[color:var(--cosmos-950)] hover:bg-[color:var(--solar-gold)]'
                : 'bg-card text-muted-foreground'
            )}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
  }
);

MessageComposer.displayName = 'MessageComposer';

export default MessageComposer;
