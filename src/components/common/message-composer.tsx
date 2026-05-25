'use client';

import { KeyboardEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Send, Paperclip, X, FileText, Music, Video, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  inputClassName?: string;
  draftFiles?: File[];
  onAddFiles?: (files: FileList) => void;
  onRemoveFile?: (index: number) => void;
  isSending?: boolean;
}

const MessageComposer = memo(
  ({
    value,
    onChange,
    onSend,
    disabled = false,
    inputClassName,
    draftFiles = [],
    onAddFiles,
    onRemoveFile,
    isSending = false,
  }: MessageComposerProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

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
        const newHeight = Math.min(
          Math.max(textarea.scrollHeight, 44),
          128
        );
        textarea.style.height = `${newHeight}px`;
      }
    }, []);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !disabled && !isSending) {
          const hasContent = value.trim().length > 0;
          const hasFiles = draftFiles.length > 0;
          if (hasContent || hasFiles) {
            e.preventDefault();
            onSend();
          }
        }
      },
      [onSend, disabled, isSending, value, draftFiles]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        setTimeout(autoResize, 0);
      },
      [onChange, autoResize]
    );

    useEffect(() => {
      autoResize();
    }, [value, autoResize]);

    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Horizontal Draft Previews Strip */}
        {draftFiles.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 max-w-full no-scrollbar">
            {draftFiles.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');
              const isAudio = file.type.startsWith('audio/');

              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative flex items-center gap-2.5 h-16 shrink-0 rounded-xl border border-primary-500/10 bg-white/[0.03] p-2 backdrop-blur-sm"
                  style={{ minWidth: isImage ? '64px' : '150px', maxWidth: '200px' }}
                >
                  {isImage ? (
                    imagePreviews[file.name] ? (
                      <Image
                        src={imagePreviews[file.name]}
                        alt={file.name}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover rounded-lg"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary-500/10 text-primary-500 rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                    )
                  ) : (
                    <>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 border border-primary-500/20">
                        {isVideo ? (
                          <Video className="h-4 w-4" />
                        ) : isAudio ? (
                          <Music className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-xs font-semibold text-primary-100">{file.name}</p>
                        <p className="text-[9px] font-bold text-primary-100/40 uppercase">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </>
                  )}

                  {/* Close Button */}
                  {!isSending && onRemoveFile && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(idx)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white border border-background shadow-md hover:bg-destructive/80 transition-all cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Composer Row */}
        <div className="flex items-end gap-3 w-full">
          {/* File Picker Trigger */}
          {onAddFiles && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    onAddFiles(e.target.files);
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
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-500/20 bg-white/[0.03] text-primary-300 hover:bg-white/[0.08] hover:text-primary-400 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Input Box */}
          <div className="group relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={isSending ? "Whispering files to Supabase..." : "Whisper to the stars..."}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isSending || disabled}
              className={cn(
                'min-h-[48px] resize-none overflow-hidden rounded-2xl border-primary-500/20 bg-white/[0.03] pl-6 pr-14 pt-3.5 text-primary-100 transition-all duration-300 placeholder:text-primary-100/30 focus-visible:ring-primary-500/30 disabled:opacity-50',
                inputClassName
              )}
              rows={1}
              style={{ height: '48px' }}
            />
            <Button
              onClick={onSend}
              disabled={isSending || disabled || (!value.trim() && draftFiles.length === 0)}
              className="absolute bottom-1.5 right-1.5 h-9 w-9 rounded-full bg-primary-500 p-0 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-90 disabled:bg-primary-500/10 disabled:text-primary-500/30"
              size="sm"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

MessageComposer.displayName = 'MessageComposer';

export default MessageComposer;
