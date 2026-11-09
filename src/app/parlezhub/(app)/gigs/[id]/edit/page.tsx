'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, SearchX } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useServices } from '@/hooks/useServices';
import type { Service } from '@/types/service';
import GigComposer, { GigComposerSkeleton } from '@/components/astrology/service/gig-composer';
import { buttonStyles, EmptyState, PageHeader } from '@/components/parlezhub/ui';

/**
 * /parlezhub/gigs/[id]/edit. Only language gigs open here: the id of one of
 * the consultant's astrology gigs reads as "not found", never as a form.
 */
export default function EditGigPage() {
  const router = useRouter();
  const serviceId = useParams().id as string;
  const { loadService, updateExistingService, isProcessing, error } = useServices({ category: 'language' });
  const [gig, setGig] = useState<Service | null>(null);
  const [missing, setMissing] = useState(false);
  const backToGigs = () => router.push(ROUTES.PARLEZHUB.GIGS);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    void loadService(serviceId).then((found) => {
      if (cancelled) return;
      if (found) setGig(found);
      else setMissing(true);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, loadService]);

  return (
    <div className="space-y-6">
      <Link href={ROUTES.PARLEZHUB.GIGS} className={buttonStyles.ghost + ' -ml-3'}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My gigs
      </Link>
      <PageHeader
        eyebrow="Language Consultant"
        title={missing ? 'Gig not found' : 'Edit gig'}
        description={missing ? undefined : 'Changes go live for learners as soon as you save.'}
      />

      {missing ? (
        <EmptyState
          icon={SearchX}
          title="This gig doesn’t exist"
          body="It may have been deleted. Your other gigs are unaffected."
          action={
            <Link href={ROUTES.PARLEZHUB.GIGS} className={buttonStyles.secondary}>
              Back to my gigs
            </Link>
          }
        />
      ) : !gig ? (
        <GigComposerSkeleton />
      ) : (
        <GigComposer
          mode="edit"
          availableTypes={['language']}
          initialData={{
            type: 'language',
            title: gig.title,
            description: gig.description,
            shortDescription: gig.shortDescription,
            price: gig.price,
            duration: gig.duration,
            tags: gig.tags,
            whatYouProvide: gig.whatYouProvide,
          }}
          onCancel={backToGigs}
          isSubmitting={isProcessing}
          error={error}
          onSubmit={async (data) => {
            try {
              await updateExistingService(gig.id, { ...data, type: 'language' });
              backToGigs();
            } catch {
              // The hook has already said why; staying keeps the edits.
            }
          }}
        />
      )}
    </div>
  );
}
