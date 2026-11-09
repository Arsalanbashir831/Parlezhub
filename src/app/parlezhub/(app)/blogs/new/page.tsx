'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useBlogMutations } from '@/hooks/useBlogs';
import { BlogComposer } from '@/components/parlezhub/blogs/blog-composer';
import { buttonStyles, PageHeader } from '@/components/parlezhub/ui';

/** /parlezhub/blogs/new — write a post and publish it or save it as a draft. */
export default function CreateBlogPage() {
  const router = useRouter();
  const { create, isSaving } = useBlogMutations();
  const backToPosts = () => router.push(ROUTES.PARLEZHUB.BLOGS);

  return (
    <div className="space-y-6">
      <Link href={ROUTES.PARLEZHUB.BLOGS} className={buttonStyles.ghost + ' -ml-3'}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My posts
      </Link>
      <PageHeader
        eyebrow="Blog"
        title="Write a post"
        description="Publish it now, or save a draft and come back to it."
      />
      <BlogComposer
        isSubmitting={isSaving}
        onCancel={backToPosts}
        onSubmit={async (data) => {
          await create(data);
          backToPosts();
        }}
      />
    </div>
  );
}
