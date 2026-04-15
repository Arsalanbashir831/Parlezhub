'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useBlogs } from '@/hooks/useBlogs';
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
  const { create } = useBlogs();
  const { isGenerating: isGeneratingContent, generateContent } =
    useAIGeneration();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in the title and content');
      return;
    }

    setIsSubmitting(true);

    try {
      await create({
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
      console.error('Failed to create blog:', error);
      toast.error('Failed to create blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!title.trim() || !metaDescription.trim()) {
      toast.error('Please fill in the title and meta description first');
      return;
    }

    const generatedContent = await generateContent({
      type: 'blog',
      title: title.trim(),
      metaDescription: metaDescription.trim(),
      maxLength: 5000,
    });

    if (generatedContent) {
      setContent(generatedContent);
      toast.success('Blog content generated successfully!');
    }
  };

  const canGenerateContent = title.trim() && metaDescription.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Blog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Write and publish your blog post
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(ROUTES.TEACHER.BLOGS)}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl border-white/5 bg-white/[0.03] shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-primary">Blog Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for SEO (recommended 150-160 characters)"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-500">
                {metaDescription.length}/160 characters
              </p>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <ImageUpload
                value={thumbnail}
                onChange={setThumbnail}
                placeholder="Upload blog thumbnail"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagsInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags for your blog"
                maxTags={10}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content *</Label>
                <AIGenerateButton
                  onClick={handleGenerateContent}
                  disabled={!canGenerateContent}
                  isGenerating={isGeneratingContent}
                />
              </div>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog content in markdown..."
                height={500}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value: 'draft' | 'published') =>
                  setStatus(value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="published">Publish Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.TEACHER.BLOGS)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !title.trim() ||
                  !content.trim() ||
                  isSubmitting ||
                  isGeneratingContent
                }
              >
                {isSubmitting ? 'Creating...' : 'Create Blog'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
