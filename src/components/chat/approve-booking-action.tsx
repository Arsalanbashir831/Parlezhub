import { useUser } from '@/contexts/user-context';
import { bookingService } from '@/services/availability';
import chatService from '@/services/chat';

import { Button } from '@/components/ui/button';

export default function ApproveBookingAction({
  fields,
}: {
  fields: Record<string, string>;
}) {
  const { user } = useUser();
  const bookingId = fields['Booking ID'];
  if (!bookingId) return null;

  const handleApprove = async () => {
    try {
      const approvedResp = await bookingService.approve(bookingId);
      const booking = (approvedResp && approvedResp.booking) || approvedResp;
      const toLocal = (iso: string) =>
        new Date(iso).toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      const teacherSummary = [
        'Booking Approved',
        `- Status: ${booking?.status ?? 'APPROVED'}`,
        booking?.start_time ? `- Start: ${toLocal(booking.start_time)}` : '',
        booking?.end_time ? `- End: ${toLocal(booking.end_time)}` : '',
        booking?.zoom_start_url ? `- Host URL: ${booking.zoom_start_url}` : '',
        // Booking ID intentionally omitted
      ]
        .filter(Boolean)
        .join('\n');

      const studentSummary = [
        'Booking Approved',
        `- Status: ${booking?.status ?? 'APPROVED'}`,
        booking?.start_time ? `- Start: ${toLocal(booking.start_time)}` : '',
        booking?.end_time ? `- End: ${toLocal(booking.end_time)}` : '',
        booking?.zoom_join_url
          ? `- Join URL: ${booking.zoom_join_url}`
          : approvedResp?.zoom_info?.join_url
            ? `- Join URL: ${approvedResp.zoom_info.join_url}`
            : '',
        // Booking ID intentionally omitted
      ]
        .filter(Boolean)
        .join('\n');

      // Send the teacher summary locally so the teacher sees host URL immediately
      chatService.appendLocal(teacherSummary, user?.id);
      // Also send the student-friendly summary via socket so it reaches the student
      if (chatService.isConnected()) chatService.sendMessage(studentSummary);
      else chatService.appendLocal(studentSummary);
    } catch (e) {
      // noop for now; could toast via a lifted handler
      console.error('Approve failed', e);
    }
  };
  return (
    <div className="mt-2">
      <Button size="sm" variant="secondary" onClick={handleApprove}>
        Approve Booking
      </Button>
    </div>
  );
}
