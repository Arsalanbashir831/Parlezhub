'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

import { useBlogs } from '@/hooks/useBlogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-editor'), {
  ssr: false,
});

export default function CreateBlogPage() {
  const router = useRouter();
  const { create } = useBlogs();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // stable content change handler
  const handleContentChange = useCallback(
    (html: string) => setContent(html),
    []
  );

  const handleSubmit = async () => {
    await create({
      title,
      content,
      thumbnail,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
    });
    router.push(ROUTES.TEACHER.BLOGS);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Blog</h1>
        <Button
          variant="ghost"
          onClick={() => router.push(ROUTES.TEACHER.BLOGS)}
        >
          Cancel
        </Button>
      </div>
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <RichTextEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Write your blog content..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Thumbnail</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return setThumbnail(undefined);
                const reader = new FileReader();
                reader.onload = () => setThumbnail(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
            {thumbnail && (
              <img
                src={thumbnail}
                alt="thumbnail"
                className="mt-2 h-24 w-24 rounded object-cover"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tags (comma separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. teaching, tips, english"
            />
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={status === 'draft' ? 'secondary' : 'outline'}
                onClick={() => setStatus('draft')}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant={status === 'published' ? 'secondary' : 'outline'}
                onClick={() => setStatus('published')}
              >
                Publish
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.TEACHER.BLOGS)}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim()}
              >
                {status === 'draft' ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
