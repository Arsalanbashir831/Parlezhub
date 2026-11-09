'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useServices } from '@/hooks/useServices';
import GigComposer from '@/components/astrology/service/gig-composer';
import { buttonStyles, PageHeader } from '@/components/parlezhub/ui';

/** /parlezhub/gigs/new — publish a language gig. Language is the only type. */
export default function CreateGigPage() {
  const router = useRouter();
  const { createNewService, isProcessing, error } = useServices({ category: 'language' });
  const backToGigs = () => router.push(ROUTES.PARLEZHUB.GIGS);

  return (
    <div className="space-y-6">
      <Link href={ROUTES.PARLEZHUB.GIGS} className={buttonStyles.ghost + ' -ml-3'}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My gigs
      </Link>
      <PageHeader
        eyebrow="Language Consultant"
        title="Create a gig"
        description="Describe one session, set its price and length. Once it is live, learners can find it and book it from your chat."
      />
      <GigComposer
        mode="create"
        availableTypes={['language']}
        onCancel={backToGigs}
        isSubmitting={isProcessing}
        error={error}
        onSubmit={async (data) => {
          try {
            await createNewService({ ...data, type: 'language' });
            backToGigs();
          } catch {
            // The hook has already said why; staying keeps the draft.
          }
        }}
      />
    </div>
  );
}
