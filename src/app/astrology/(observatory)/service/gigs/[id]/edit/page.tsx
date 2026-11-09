'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { Service, ServiceFormData } from '@/types/service';
import { useServices } from '@/hooks/useServices';
import GigComposer, { GigComposerSkeleton } from '@/components/astrology/service/gig-composer';
import { EmptyNotice } from '@/components/astrology/ui/observatory-state';

export default function EditGigPage() {
  const router = useRouter();
  const serviceId = useParams().id as string;
  const { loadService, updateExistingService, isProcessing, error } = useServices({ category: 'astrology' });

  const [service, setService] = useState<Service | null>(null);
  const [missing, setMissing] = useState(false);

  const backToGigs = () => router.push(ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS);

  useEffect(() => {
    if (!serviceId) return;
    loadService(serviceId).then(found => {
      if (found) setService(found);
      else setMissing(true);
    });
  }, [serviceId, loadService]);

  if (missing) {
    return (
      <div className="flex min-w-0 flex-col gap-7">
        <GigHeader title="Gig not found" note="This gig no longer exists — it may have been deleted from another device." />
        <EmptyNotice
          title="Nothing to edit here"
          message="Your other gigs are unaffected. Open My Gigs to pick one."
          action={<button type="button" className="obs-control text-xs" onClick={backToGigs}>Back to my gigs</button>}
        />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-w-0 flex-col gap-7">
        <GigHeader title="Edit gig" note="Changes go live for students the moment you save them." />
        <GigComposerSkeleton />
      </div>
    );
  }

  const initialData: Partial<ServiceFormData> = {
    type: service.type,
    title: service.title,
    description: service.description,
    shortDescription: service.shortDescription,
    price: service.price,
    duration: service.duration,
    tags: service.tags,
    whatYouProvide: service.whatYouProvide,
  };

  return (
    <div className="flex min-w-0 flex-col gap-7">
      <GigHeader title="Edit gig" note="Changes go live for students the moment you save them." />
      <GigComposer
        mode="edit"
        initialData={initialData}
        availableTypes={[service.type]}
        onCancel={backToGigs}
        isSubmitting={isProcessing}
        error={error}
        onSubmit={async data => {
          try {
            await updateExistingService(service.id, data);
            backToGigs();
          } catch {
            // The hook already reported it; staying on the form keeps the draft.
          }
        }}
      />
    </div>
  );
}

function GigHeader({ title, note }: { title: string; note: string }) {
  const router = useRouter();
  return (
    <header className="space-y-5">
      <button type="button" className="obs-control gap-2 text-xs" onClick={() => router.push(ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS)}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to my gigs
      </button>
      <div>
        <p className="obs-label mb-3">Astrologer Service</p>
        <h1 className="obs-title">{title}</h1>
        <p className="obs-muted mt-3 max-w-xl text-sm">{note}</p>
      </div>
    </header>
  );
}
