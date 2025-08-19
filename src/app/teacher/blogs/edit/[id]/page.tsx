'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

import { useBlogs } from '@/hooks/useBlogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-editor'), {
  ssr: false,
});

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const { loadOne, update } = useBlogs();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const handleContentChange = useCallback(
    (html: string) => setContent(html),
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const blog = await loadOne(blogId);
      if (blog) {
        setTitle(blog.title);
        setContent(blog.content);
        setTags((blog.tags || []).join(', '));
        setThumbnail(blog.thumbnail);
        setStatus(blog.status);
      }
      setLoading(false);
    };
    void load();
  }, [blogId, loadOne]);

  const handleSave = async () => {
    await update(blogId, {
      title,
      content,
      thumbnail,
      status,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    router.push(ROUTES.TEACHER.BLOGS);
  };

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Blog</h1>
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <RichTextEditor value={content} onChange={handleContentChange} />
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
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
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
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
