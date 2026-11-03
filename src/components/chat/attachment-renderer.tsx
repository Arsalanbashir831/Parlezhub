'use client';

import { memo } from 'react';
import Image from 'next/image';
import { FileText, Download, Music, Video, Eye } from 'lucide-react';
import { Attachment } from '@/types/chat';

interface AttachmentRendererProps {
  attachment: Attachment;
}

const AttachmentRenderer = memo(function AttachmentRenderer({ attachment }: AttachmentRendererProps) {
  const { file_url, file_name, file_type, file_size } = attachment;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (name: string, type: string): string => {
    if (name.includes('.')) {
      return name.split('.').pop()?.toUpperCase() || 'FILE';
    }
    return type.split('/')[1]?.toUpperCase() || 'FILE';
  };

  const fileIcon = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-[color-mix(in_srgb,var(--solar-orange)_10%,transparent)] text-[var(--solar-orange)]">
      <FileText className="h-4 w-4" />
    </div>
  );

  // 1. Images
  if (file_type.startsWith('image/')) {
    return (
      <div className="group relative my-1.5 overflow-hidden rounded-xl border border-border bg-black/20 transition-colors hover:border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)]">
        <div className="relative max-h-72 overflow-hidden">
          <Image
            src={file_url}
            alt={file_name}
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <a
              href={file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:text-[var(--solar-orange)]"
            >
              <Eye className="h-3.5 w-3.5" />
              View full
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-card/60 p-2.5">
          <span className="max-w-[70%] truncate text-xs text-foreground">
            {file_name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatFileSize(file_size)}
          </span>
        </div>
      </div>
    );
  }

  // 2. Video
  if (file_type.startsWith('video/')) {
    return (
      <div className="group relative my-1.5 overflow-hidden rounded-xl border border-border bg-black/30 transition-colors hover:border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)]">
        <div className="relative aspect-video w-full overflow-hidden">
          <video
            src={file_url}
            controls
            className="h-full w-full object-cover"
            preload="metadata"
          />
        </div>
        <div className="flex items-center gap-2.5 border-t border-border bg-card/60 p-2.5 backdrop-blur-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-[color-mix(in_srgb,var(--solar-orange)_10%,transparent)] text-[var(--solar-orange)]">
            <Video className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-foreground">{file_name}</p>
            <p className="text-[10px] text-muted-foreground">
              {getFileExtension(file_name, file_type)} • {formatFileSize(file_size)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Audio
  if (file_type.startsWith('audio/')) {
    return (
      <div className="group my-1.5 overflow-hidden rounded-xl border border-border bg-black/20 p-3 transition-colors hover:border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)]">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-[color-mix(in_srgb,var(--solar-orange)_12%,transparent)] text-[var(--solar-orange)]">
            <Music className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{file_name}</p>
            <p className="text-[10px] text-muted-foreground">
              {getFileExtension(file_name, file_type)} • {formatFileSize(file_size)}
            </p>
          </div>
        </div>
        <audio
          src={file_url}
          controls
          className="h-8 w-full accent-[var(--solar-orange)]"
        />
      </div>
    );
  }

  // 4. Documents (PDF, doc, xlsx, etc.)
  return (
    <a
      href={file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative my-1.5 flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-border bg-[var(--surface-2)] p-3 transition-colors hover:border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)]"
    >
      <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-[var(--solar-orange)]" />

      <div className="flex min-w-0 items-center gap-3">
        {fileIcon}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground transition-colors group-hover:text-[var(--solar-orange)]">
            {file_name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {getFileExtension(file_name, file_type)} • {formatFileSize(file_size)}
          </p>
        </div>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors group-hover:text-[var(--solar-orange)]">
        <Download className="h-4 w-4" />
      </div>
    </a>
  );
});

export default AttachmentRenderer;
