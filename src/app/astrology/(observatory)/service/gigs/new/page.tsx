'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useServices } from '@/hooks/useServices';
import GigComposer from '@/components/astrology/service/gig-composer';

export default function CreateGigPage() {
  const router = useRouter();
  const { createNewService, isProcessing, error } = useServices({ category: 'astrology' });
  const backToGigs = () => router.push(ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS);

  return (
    <div className="flex min-w-0 flex-col gap-7">
      <header className="space-y-5">
        <button type="button" className="obs-control gap-2 text-xs" onClick={backToGigs}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to my gigs
        </button>
        <div>
          <p className="obs-label mb-3">Astrologer Service</p>
          <h1 className="obs-title">Create a gig</h1>
          <p className="obs-muted mt-3 max-w-xl text-sm">
            Price one offering, say exactly what the session covers, and it lands on your profile and in every booking card a student opens.
          </p>
        </div>
      </header>

      <GigComposer
        mode="create"
        onCancel={backToGigs}
        isSubmitting={isProcessing}
        error={error}
        onSubmit={async data => {
          try {
            await createNewService(data);
            backToGigs();
          } catch {
            // The hook already reported it; staying on the form keeps the draft.
          }
        }}
      />
    </div>
  );
}
