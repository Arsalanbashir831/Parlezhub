'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import { useBlogs } from '@/hooks/useBlogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BlogsPage() {
  const { blogs, isLoading, toggleVisibility, remove } = useBlogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage your blog posts.
          </p>
        </div>
        <Link href={ROUTES.TEACHER.CREATE_BLOG}>
          <Button>Create New Blog</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="h-40 animate-pulse" />
            </Card>
          ))}
        </div>
      ) : blogs.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <Card key={b.id} className="flex flex-col overflow-hidden">
              {b.thumbnail && (
                <div className="h-40 w-full overflow-hidden bg-gray-100">
                  <img
                    src={b.thumbnail}
                    alt={b.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{b.title}</CardTitle>
                <div className="text-xs text-gray-500">
                  {new Date(b.updatedAt).toLocaleString()}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="text-xs uppercase">{b.status}</div>
                <div className="mt-auto flex gap-2">
                  <Link href={ROUTES.TEACHER.EDIT_BLOG(b.id)}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void toggleVisibility(b.id)}
                  >
                    {b.status === 'published' ? 'Hide' : 'Publish'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void remove(b.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No blogs yet. Create your first blog post.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
