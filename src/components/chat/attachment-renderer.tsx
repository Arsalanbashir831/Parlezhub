'use client';

import { memo } from 'react';
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

  // 1. Image Formats (jpg, png, gif, webp)
  if (file_type.startsWith('image/')) {
    return (
      <div className="group relative my-1.5 overflow-hidden rounded-xl border border-primary-500/10 bg-black/20 shadow-md transition-[border-color,box-shadow] duration-300 hover:border-primary-500/30 hover:shadow-primary-500/5">
        <div className="relative max-h-72 overflow-hidden">
          <img
            src={file_url}
            alt={file_name}
            className="w-full object-cover will-change-transform transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
            <a
              href={file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-background/80 px-2.5 py-1 text-xs font-bold text-primary-500 hover:bg-primary-500 hover:text-primary-950 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              View Full
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-primary-500/10 bg-background/60 p-2.5">
          <span className="truncate text-xs font-medium text-primary-100 max-w-[70%]">
            {file_name}
          </span>
          <span className="text-[10px] text-primary-100/40">
            {formatFileSize(file_size)}
          </span>
        </div>
      </div>
    );
  }

  // 2. Video Formats (mp4, mov)
  if (file_type.startsWith('video/')) {
    return (
      <div className="group relative my-1.5 overflow-hidden rounded-xl border border-primary-500/10 bg-black/30 shadow-md transition-[border-color,box-shadow] duration-300 hover:border-primary-500/30 hover:shadow-primary-500/5">
        <div className="relative aspect-video w-full overflow-hidden">
          <video
            src={file_url}
            controls
            className="h-full w-full object-cover"
            preload="metadata"
          />
        </div>
        <div className="flex items-center gap-2.5 border-t border-primary-500/10 bg-background/40 p-2.5 backdrop-blur-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
            <Video className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-primary-100">{file_name}</p>
            <p className="text-[9px] font-bold text-primary-100/40 uppercase">
              {getFileExtension(file_name, file_type)} • {formatFileSize(file_size)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Audio Formats (mp3, wav, m4a, ogg)
  if (file_type.startsWith('audio/')) {
    return (
      <div className="group my-1.5 overflow-hidden rounded-xl border border-primary-500/10 bg-black/20 p-3 shadow-md transition-[border-color,box-shadow] duration-300 hover:border-primary-500/30 hover:shadow-primary-500/5">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 text-primary-500 shadow-[0_0_8px_rgba(212,175,55,0.1)]">
            <Music className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-primary-100">{file_name}</p>
            <p className="text-[9px] font-bold text-primary-100/40 uppercase">
              {getFileExtension(file_name, file_type)} • {formatFileSize(file_size)}
            </p>
          </div>
        </div>
        <audio src={file_url} controls className="h-8 w-full accent-primary-500" />
      </div>
    );
  }

  // 4. Document / Generic Formats (PDFs, doc, xlsx, etc.)
  return (
    <a
      href={file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative my-1.5 flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-primary-500/10 bg-white/[0.04] p-3 shadow-md transition-all duration-300 hover:border-primary-500/30 hover:bg-white/[0.08] hover:shadow-primary-500/5"
    >
      {/* Decorative vertical color strip */}
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-500 shadow-[0_0_8px_rgba(212,175,55,0.3)]" />

      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 group-hover:bg-primary-500/20 transition-all duration-300">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-primary-100 group-hover:text-primary-400 transition-colors">
            {file_name}
          </p>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-primary-100/30">
            {getFileExtension(file_name, file_type)} • {formatFileSize(file_size)}
          </p>
        </div>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary-100/50 group-hover:bg-primary-500 group-hover:text-primary-950 group-hover:scale-105 active:scale-95 will-change-transform transition-[background-color,color,transform] duration-300">
        <Download className="h-4 w-4 group-hover:animate-bounce" />
      </div>
    </a>
  );
});

export default AttachmentRenderer;
