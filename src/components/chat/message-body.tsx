import { useAuth } from '@/contexts/auth-context';

import { cn } from '@/lib/utils';

import ApproveBookingAction from './approve-booking-action';
import PaymentBookingAction from './payment-booking-action';

export default function MessageBody({ content }: { content: string }) {
  const { userRole } = useAuth();
  const isBookingRequested = content?.startsWith('Booking Requested');
  const isBookingApproved = content?.startsWith('Booking Approved');
  const isBookingConfirmed = content?.startsWith('Booking Confirmed');

  if (!isBookingRequested && !isBookingApproved && !isBookingConfirmed) {
    return <p className="whitespace-pre-wrap break-words text-sm">{content}</p>;
  }

  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const fields: Record<string, string> = {};
  lines.slice(1).forEach((l) => {
    const idx = l.indexOf(':');
    if (idx > -1) {
      const key = l.slice(2, idx).trim();
      const val = l.slice(idx + 1).trim();
      fields[key] = val;
    }
  });

  // Check if booking needs payment (confirmed but unpaid)
  const needsPayment =
    (isBookingApproved || isBookingConfirmed) &&
    fields['Status']?.includes('CONFIRMED') &&
    fields['Payment Status']?.includes('UNPAID');

  return (
    <div className="relative my-2 overflow-hidden rounded-2xl border border-border bg-[var(--surface-2)] p-5">
      {/* Accent bar */}
      <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-[var(--solar-orange)]" />

      <p className="obs-label mb-4 text-[var(--solar-orange)]">
        {isBookingApproved || isBookingConfirmed
          ? 'Booking Confirmed'
          : 'Booking Requested'}
      </p>

      <div className="space-y-2.5">
        {fields['Service'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Service
            </span>
            <span className="text-right text-xs font-bold foreground">
              {fields['Service']}
            </span>
          </div>
        )}
        {fields['Status'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Status
            </span>
            <span
              className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest',
                fields['Status'].includes('CONFIRMED') ||
                  fields['Status'].includes('APPROVED')
                  ? 'border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_12%,transparent)] text-[var(--solar-orange)]'
                  : 'border-white/10 bg-white/5 text-muted-foreground'
              )}
            >
              {fields['Status']}
            </span>
          </div>
        )}
        {fields['Start'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Start
            </span>
            <span className="text-right text-xs font-bold foreground">
              {fields['Start']}
            </span>
          </div>
        )}
        {fields['End'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              End
            </span>
            <span className="text-right text-xs font-bold foreground">
              {fields['End']}
            </span>
          </div>
        )}
        {fields['Payment Status'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Payment
            </span>
            <span
              className={cn(
                'text-[10px] font-extrabold uppercase tracking-widest',
                fields['Payment Status'] === 'UNPAID'
                  ? 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                  : 'text-[var(--solar-orange)]'
              )}
            >
              {fields['Payment Status']}
            </span>
          </div>
        )}

        <div className="pt-2">
          {!isBookingApproved &&
          !isBookingConfirmed &&
          userRole === 'TEACHER' ? (
            <ApproveBookingAction fields={fields} />
          ) : null}

          {needsPayment && userRole === 'STUDENT' ? (
            <PaymentBookingAction fields={fields} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
