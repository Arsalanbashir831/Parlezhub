import { useUser } from '@/contexts/user-context';
import {
  BookingApprovalResponse,
  bookingService,
} from '@/services/availability';
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
      const approvedResp: BookingApprovalResponse =
        await bookingService.approve(bookingId);
      const booking = approvedResp.booking;
      const toLocal = (iso: string) =>
        new Date(iso).toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      const serviceName = fields['Service'] || 'Service';

      const teacherSummary = [
        'Booking Approved',
        `- Service: ${serviceName}`,
        `- Status: ${booking?.status ?? 'APPROVED'}`,
        booking?.start_time ? `- Start: ${toLocal(booking.start_time)}` : '',
        booking?.end_time ? `- End: ${toLocal(booking.end_time)}` : '',
        booking?.payment_status
          ? `- Payment Status: ${booking.payment_status}`
          : '',
        booking?.zoom_start_url ? `- Host URL: ${booking.zoom_start_url}` : '',
        `- Booking ID: ${booking?.id || bookingId}`,
      ]
        .filter(Boolean)
        .join('\n');

      const studentSummary = [
        'Booking Approved',
        `- Service: ${serviceName}`,
        `- Status: ${booking?.status ?? 'APPROVED'}`,
        booking?.start_time ? `- Start: ${toLocal(booking.start_time)}` : '',
        booking?.end_time ? `- End: ${toLocal(booking.end_time)}` : '',
        booking?.payment_status
          ? `- Payment Status: ${booking.payment_status}`
          : '',
        booking?.zoom_join_url
          ? `- Join URL: ${booking.zoom_join_url}`
          : approvedResp?.zoom_info?.join_url
            ? `- Join URL: ${approvedResp.zoom_info.join_url}`
            : '',
        `- Booking ID: ${booking?.id || bookingId}`,
      ]
        .filter(Boolean)
        .join('\n');

      // Send the teacher summary locally so the teacher sees host URL immediatelyyy
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
    <div className="mt-4">
      <Button
        size="sm"
        variant="default"
        onClick={handleApprove}
        className="h-9 rounded-xl bg-primary-500 px-6 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
      >
        Approve Booking
      </Button>
    </div>
  );
}
