'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, SearchX } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useBlog, useBlogMutations } from '@/hooks/useBlogs';
import { BlogComposer, BlogComposerSkeleton } from '@/components/parlezhub/blogs/blog-composer';
import { buttonStyles, EmptyState, PageHeader } from '@/components/parlezhub/ui';

/** /parlezhub/blogs/[id]/edit — change a post, publish it or move it to drafts. */
export default function EditBlogPage() {
  const router = useRouter();
  const blogId = useParams().id as string;
  const { data: post, isLoading, isError } = useBlog(blogId);
  const { update, isSaving } = useBlogMutations();
  const backToPosts = () => router.push(ROUTES.PARLEZHUB.BLOGS);
  const missing = isError || (!isLoading && !post);

  return (
    <div className="space-y-6">
      <Link href={ROUTES.PARLEZHUB.BLOGS} className={buttonStyles.ghost + ' -ml-3'}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My posts
      </Link>
      <PageHeader
        eyebrow="Blog"
        title={missing ? 'Post not found' : 'Edit post'}
        description={missing ? undefined : 'Edits to a published post go live as soon as you save.'}
      />

      {missing ? (
        <EmptyState
          icon={SearchX}
          title="This post doesn’t exist"
          body="It may have been deleted. Your other posts are unaffected."
          action={
            <Link href={ROUTES.PARLEZHUB.BLOGS} className={buttonStyles.secondary}>
              Back to my posts
            </Link>
          }
        />
      ) : !post ? (
        <BlogComposerSkeleton />
      ) : (
        <BlogComposer
          key={post.id}
          initial={post}
          isSubmitting={isSaving}
          onCancel={backToPosts}
          onSubmit={async (data) => {
            await update(post.id, data);
            backToPosts();
          }}
        />
      )}
    </div>
  );
}
