'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

import { useBlogs } from '@/hooks/useBlogs';
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

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const { loadOne, update, isProcessing } = useBlogs();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const blog = await loadOne(blogId);
      if (blog) {
        setTitle(blog.title);
        setContent(blog.content || '');
        setMetaDescription(blog.meta_description || '');
        setTags(blog.tags || []);
        setStatus(blog.status);
        // Note: thumbnail from API is URL string, not File object
        // We'll handle this differently - show existing thumbnail but allow new upload
      }
      setIsLoading(false);
    };
    void load();
  }, [blogId, loadOne]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in the title and content');
      return;
    }


    try {
      await update(blogId, {
        title: title.trim(),
        content: content.trim(),
        meta_description: metaDescription.trim() || undefined,
        thumbnail,
        tags,
        status,
      });
      toast.success(
        `Blog ${status === 'published' ? 'published' : 'saved as draft'} successfully!`
      );
      router.push(ROUTES.TEACHER.BLOGS);
    } catch (error) {
      console.error('Failed to update blog:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
        <div className="font-serif text-lg font-bold text-primary-100/60">Loading blog...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
            Edit <span className="text-primary-500">Blog</span>
          </h1>
          <p className="mt-2 text-primary-100/60 font-medium">
            Refine your story and keep your audience engaged with fresh updates.
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
                className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
              />
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
                placeholder="Upload new thumbnail image (optional)"
              />
              <p className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/20">
                Leave empty to keep existing thumbnail
              </p>
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
              <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Content *</Label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog content in markdown..."
                height={500}
              />
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
                disabled={!title.trim() || !content.trim() || isProcessing}
                className="h-12 rounded-xl bg-primary-500 px-8 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary-600 active:scale-95"
              >
                {isProcessing ? 'Updating...' : 'Update Blog'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
