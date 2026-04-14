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
    <div className="relative my-2 overflow-hidden rounded-2xl border border-primary-500/10 bg-white/[0.03] p-5 shadow-xl backdrop-blur-sm transition-all hover:bg-white/[0.05]">
      {/* Accent bar */}
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-500 shadow-[0_0_10px_rgba(212,175,55,0.3)]" />

      <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-500">
        {isBookingApproved || isBookingConfirmed
          ? 'Booking Confirmed'
          : 'Booking Requested'}
      </p>

      <div className="space-y-2.5">
        {fields['Service'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              Service
            </span>
            <span className="text-right text-xs font-bold text-primary-100">
              {fields['Service']}
            </span>
          </div>
        )}
        {fields['Status'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              Status
            </span>
            <span
              className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest',
                fields['Status'].includes('CONFIRMED') ||
                  fields['Status'].includes('APPROVED')
                  ? 'border-primary-500/30 bg-primary-500/10 text-primary-500'
                  : 'border-white/10 bg-white/5 text-primary-100/60'
              )}
            >
              {fields['Status']}
            </span>
          </div>
        )}
        {fields['Start'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              Start
            </span>
            <span className="text-right text-xs font-bold text-primary-100">
              {fields['Start']}
            </span>
          </div>
        )}
        {fields['End'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              End
            </span>
            <span className="text-right text-xs font-bold text-primary-100">
              {fields['End']}
            </span>
          </div>
        )}
        {fields['Payment Status'] && (
          <div className="group flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
              Payment
            </span>
            <span
              className={cn(
                'text-[10px] font-extrabold uppercase tracking-widest',
                fields['Payment Status'] === 'UNPAID'
                  ? 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                  : 'text-primary-500 drop-shadow-[0_0_8px_rgba(212,175,55,0.2)]'
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
