'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useBlogs } from '@/hooks/useBlogs';
import { extractFieldErrors } from '@/lib/error-utils';
import AIGenerateButton from '@/components/ui/ai-generate-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MarkdownEditor from '@/components/ui/markdown-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TagsInput from '@/components/ui/tags-input';
import { Textarea } from '@/components/ui/textarea';

export default function CreateBlogPage() {
  const router = useRouter();
  const { create, isProcessing } = useBlogs();
  const { isGenerating: isGeneratingContent, generateContent } =
    useAIGeneration();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing) return;

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in the title and content');
      return;
    }

    setErrors({});

    try {
      await create({
        title: title.trim(),
        content: content.trim(),
        meta_description: metaDescription.trim() || undefined,
        thumbnail,
        tags,
        status,
      });
      // useBlogs handles success toast and redirection
      router.push(ROUTES.TEACHER.BLOGS);
    } catch (error) {
      console.error('Failed to create blog:', error);
      setErrors(extractFieldErrors(error));
    }
  };

  const handleGenerateContent = async () => {
    if (!title.trim() || !metaDescription.trim()) {
      toast.error('Please fill in the title and meta description first');
      return;
    }

    try {
      const { content, error: generationError } = await generateContent({
        type: 'blog',
        title: title.trim(),
        metaDescription: metaDescription.trim(),
        maxLength: 5000,
      });

      if (content) {
        setContent(content);
        toast.success('Blog content generated successfully!');
      } else if (generationError) {
        toast.error(generationError);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate content');
    }
  };

  const canGenerateContent = title.trim() && metaDescription.trim();

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
            Create New <span className="text-primary-500">Blog</span>
          </h1>
          <p className="mt-2 text-primary-100/60 font-medium">
            Draft your masterpiece and share your unique vision with your audience.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(ROUTES.TEACHER.BLOGS)}
          className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white px-6 font-bold"
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="font-serif text-2xl font-bold text-primary-500">Blog Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                required
                className={`h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30 ${
                  errors.title ? 'border-red-500/50' : ''
                }`}
              />
              {errors.title && (
                <p className="ml-1 text-xs font-medium text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta-description" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for SEO (recommended 150-160 characters)"
                rows={3}
                maxLength={160}
                className="rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
              />
              <p className="ml-1 text-xs text-primary-100/40">
                {metaDescription.length}/160 characters
              </p>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Thumbnail Image</Label>
              <ImageUpload
                value={thumbnail}
                onChange={setThumbnail}
                placeholder="Upload blog thumbnail"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Tags</Label>
              <TagsInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags for your blog"
                maxTags={10}
              />
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Content *</Label>
                <AIGenerateButton
                  onClick={handleGenerateContent}
                  disabled={!canGenerateContent}
                  isGenerating={isGeneratingContent}
                />
              </div>
              <div className={`rounded-xl ${errors.content ? 'ring-1 ring-red-500/50' : ''}`}>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog content in markdown..."
                  height={500}
                />
              </div>
              {errors.content && (
                <p className="ml-1 text-xs font-medium text-red-400">{errors.content}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Status</Label>
              <Select
                value={status}
                onValueChange={(value: 'draft' | 'published') =>
                  setStatus(value)
                }
              >
                <SelectTrigger className="h-12 w-48 rounded-xl border-primary-500/10 bg-white/5 text-primary-100 focus:ring-primary-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-primary-500/10 bg-background text-white">
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="published">Publish Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.TEACHER.BLOGS)}
                disabled={isProcessing}
                className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white px-8 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !title.trim() ||
                  isProcessing ||
                  isGeneratingContent
                }
                className="h-12 rounded-xl bg-primary-500 px-8 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary-600 active:scale-95"
              >
                {isProcessing ? 'Creating...' : 'Create Blog'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
