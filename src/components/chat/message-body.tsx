import { useAuth } from '@/contexts/auth-context';

import ApproveBookingAction from './approve-booking-action';

export default function MessageBody({ content }: { content: string }) {
  const { userRole } = useAuth();
  const isBookingRequested = content?.startsWith('Booking Requested');
  const isBookingApproved = content?.startsWith('Booking Approved');
  if (!isBookingRequested && !isBookingApproved) {
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

  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold">
        {isBookingApproved ? 'Booking Confirmed' : 'Booking Requested'}
      </p>
      <div className="text-xs opacity-90">
        {fields['Status'] && (
          <div className="flex justify-between gap-3">
            <span>Status</span>
            <span>{fields['Status']}</span>
          </div>
        )}
        {fields['Start'] && (
          <div className="flex justify-between gap-3">
            <span>Start</span>
            <span>{fields['Start']}</span>
          </div>
        )}
        {fields['End'] && (
          <div className="flex justify-between gap-3">
            <span>End</span>
            <span>{fields['End']}</span>
          </div>
        )}
        {/* Render meeting links after approval based on role */}
        {/* {isBookingApproved && userRole === 'TEACHER' && fields['Host URL'] && (
          <a
            href={fields['Host URL']}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] underline"
          >
            Start Meeting
          </a>
        )}
        {isBookingApproved && userRole === 'STUDENT' && fields['Join URL'] && (
          <a
            href={fields['Join URL']}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] underline"
          >
            Join Meeting
          </a>
        )} */}

        {!isBookingApproved && userRole === 'TEACHER' ? (
          <ApproveBookingAction fields={fields} />
        ) : null}
      </div>
    </div>
  );
}
