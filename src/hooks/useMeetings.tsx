'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useUser } from '@/contexts/user-context';
import {
  bookingService,
  RefundBookingRequest,
  RescheduleBookingRequest,
} from '@/services/availability';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { formatDateTime } from '@/lib/utils';

export type MeetingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export interface Meeting {
  id: string;
  consultantName?: string; // Optional for consultant view
  studentName?: string; // For consultant view
  consultantAvatar?: string;
  studentAvatar?: string; // For consultant view
  subject: string;
  date: string; // ISO string
  endDate?: string; // ISO string (meeting end)
  duration: number; // minutes
  status: MeetingStatus;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PENDING';
  language: string;
  price: number;
  location: string;
  meetingLink?: string; // deprecated: prefer joinLink/hostLink
  joinLink?: string;
  hostLink?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  cancelReason?: string;
  // Payment information for refunds
  paymentId?: number;
  amountPaid?: number;
  paymentDetails?: {
    platformFee?: number;
    sessionCost?: number;
    totalAmount?: number;
    currency?: string;
  };
}

// API response shape for bookings
interface ApiBooking {
  id: string | number;
  teacher_name?: string;
  student_name?: string;
  start_time: string; // ISO
  end_time?: string; // ISO
  finish_time?: string; // ISO
  duration_minutes?: number;
  duration_hours?: string;
  scheduled_datetime?: string;
  status?: string;
  payment_status?: string;
  language?: string;
  price?: number;
  zoom_meeting_id?: number;
  zoom_start_url?: string;
  zoom_join_url?: string;
  zoom_password?: string;
  notes?: string;
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
  student?: string;
  teacher?: string;
  gig?: number;
  // Payment information
  payment_id?: number;
  payment_details?: {
    payment_id: number;
    amount_paid: number;
    payment_status: string;
    stripe_payment_intent_id: string;
    platform_fee: number;
    session_cost: number;
    total_amount: number;
    payment_date: string;
    currency: string;
  };
}

export function useMeetings() {
  const router = useRouter();

  // Determine if we're in consultant or student context
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Load meetings from API
  const {
    data: meetings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ApiBooking[], Error, Meeting[]>({
    queryKey: ['bookings', user?.role],
    queryFn: async () =>
      bookingService.getMy(user?.role as 'TEACHER' | 'STUDENT'),
    select: (data: ApiBooking[]) => {
      const role = (user?.role || '').toLowerCase();
      return (data || []).map((b: ApiBooking) => {
        const startIso = b.start_time;
        const endIso = b.end_time || b.finish_time;
        const durationMin =
          b.duration_minutes ??
          (startIso && endIso
            ? Math.max(
              0,
              Math.round(
                (new Date(endIso).getTime() - new Date(startIso).getTime()) /
                60000
              )
            )
            : 60);
        return {
          id: String(b.id),
          consultantName: b.teacher_name,
          studentName: b.student_name,
          subject: 'Language Session',
          date: startIso,
          endDate: endIso,
          duration: durationMin,
          status: (b.status as MeetingStatus) || 'PENDING',
          paymentStatus:
            (b.payment_status as 'PAID' | 'UNPAID' | 'PENDING') || 'UNPAID',
          language: b.language || 'N/A',
          price: b.price || 0,
          location: 'Online',
          meetingLink: role === 'consultant' ? b.zoom_start_url : b.zoom_join_url,
          joinLink: b.zoom_join_url,
          hostLink: b.zoom_start_url,
          notes: b.notes,
          paymentId: b.payment_id || b.payment_details?.payment_id,
          amountPaid: b.payment_details?.amount_paid,
          paymentDetails: b.payment_details ? {
            platformFee: b.payment_details.platform_fee,
            sessionCost: b.payment_details.session_cost,
            totalAmount: b.payment_details.total_amount,
            currency: b.payment_details.currency,
          } : undefined,
        };
      });
    },
    enabled: Boolean(user?.id && user?.role),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({
      bookingId,
      reason,
      shouldRefund,
      meeting,
    }: {
      bookingId: string;
      reason: string;
      shouldRefund: boolean;
      meeting?: Meeting;
    }) => {
      // First cancel the booking
      await bookingService.cancel(bookingId, reason);

      // If refund is needed, process the refund
      if (
        shouldRefund &&
        meeting?.paymentId &&
        meeting?.amountPaid &&
        user?.role
      ) {
        const refundData: RefundBookingRequest = {
          payment_id: meeting.paymentId,
          reason: reason,
          requested_amount_dollars: meeting.amountPaid,
        };

        await bookingService.refund(
          refundData,
          user.role as 'STUDENT' | 'TEACHER'
        );
      }
    },
    onSuccess: async (_, variables) => {
      let message = 'Booking cancelled';
      if (variables.shouldRefund) {
        message =
          user?.role === 'TEACHER'
            ? 'Booking cancelled and refund processed for student'
            : 'Booking cancelled and refund processed';
      }
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error, variables) => {
      let message = 'Failed to cancel booking';
      if (variables.shouldRefund) {
        message =
          user?.role === 'TEACHER'
            ? 'Failed to cancel booking or process refund for student'
            : 'Failed to cancel booking or process refund';
      }
      toast.error(message);
    },
  });
  const approveMutation = useMutation({
    mutationFn: async (bookingId: string) => bookingService.approve(bookingId),
    onSuccess: async () => {
      toast.success('Booking approved');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error('Failed to approve booking'),
  });
  const rescheduleMutation = useMutation({
    mutationFn: async ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: RescheduleBookingRequest;
    }) => bookingService.reschedule(bookingId, data),
    onSuccess: async () => {
      toast.success('Meeting rescheduled successfully');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error('Failed to reschedule meeting'),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'pending' | 'pendingPayment' | 'upcoming' | 'completed' | 'cancelled'
  >('upcoming');

  // Normalized user role for consumers (e.g., UI components)
  const userRole: 'teacher' | 'student' | '' = (
    user?.role ? user.role.toLowerCase() : ''
  ) as 'teacher' | 'student' | '';

  // Handlers
  const handleJoinMeeting = useCallback((meeting: Meeting) => {
    if (meeting.meetingLink) window.open(meeting.meetingLink, '_blank');
  }, []);

  const handleMessageConsultant = useCallback(
    (personId: string) => {
      if (user?.role === 'TEACHER') {
        // Consultant messaging a student
        router.push(ROUTES.TEACHER.CHAT + '?student=' + personId);
      } else {
        // Student messaging a consultant
        router.push(ROUTES.STUDENT.CHAT + '?consultant=' + personId);
      }
    },
    [router, user?.role]
  );

  const getStatusColor = useCallback((status: MeetingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Derived data
  const filteredMeetings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const now = new Date();

    const filtered = (meetings || []).filter((m) => {
      // Search matches both consultant and student names
      const matchesSearch =
        m.consultantName?.toLowerCase().includes(q) ||
        m.studentName?.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q);

      let matchesTab = true;
      const end = m.endDate ? new Date(m.endDate) : new Date(m.date);
      if (activeTab === 'pending') {
        matchesTab = m.status === 'PENDING';
      } else if (activeTab === 'pendingPayment') {
        matchesTab = m.status === 'CONFIRMED' && m.paymentStatus === 'UNPAID';
      } else if (activeTab === 'upcoming') {
        // Show ongoing and future confirmed meetings with paid status
        matchesTab =
          m.status === 'CONFIRMED' && m.paymentStatus === 'PAID' && end > now;
      } else if (activeTab === 'completed') {
        // Completed only if confirmed and end time has passed
        matchesTab = m.status === 'CONFIRMED' && end <= now;
      } else if (activeTab === 'cancelled') {
        matchesTab = m.status === 'CANCELLED';
      }

      return matchesSearch && matchesTab;
    });

    // Sort ascending by start time
    return filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [meetings, searchQuery, activeTab]);

  const counts = useMemo(() => {
    const now = new Date();
    const pending = meetings.filter((m) => m.status === 'PENDING').length;
    const pendingPayment = meetings.filter(
      (m) => m.status === 'CONFIRMED' && m.paymentStatus === 'UNPAID'
    ).length;
    const upcoming = meetings.filter((m) => {
      const end = m.endDate ? new Date(m.endDate) : new Date(m.date);
      return (
        m.status === 'CONFIRMED' && m.paymentStatus === 'PAID' && end > now
      );
    }).length;
    const completed = meetings.filter((m) => {
      const end = m.endDate ? new Date(m.endDate) : new Date(m.date);
      return m.status === 'CONFIRMED' && end <= now;
    }).length;
    const cancelled = meetings.filter((m) => m.status === 'CANCELLED').length;
    return { pending, pendingPayment, upcoming, completed, cancelled };
  }, [meetings]);

  const totalCompletedHours = useMemo(() => {
    const now = new Date();
    const mins = meetings
      .filter((m) => {
        if (m.status !== 'CONFIRMED') return false;
        const end = m.endDate ? new Date(m.endDate) : new Date(m.date);
        return end <= now;
      })
      .reduce((sum, m) => sum + m.duration, 0);
    return Math.round(mins / 60);
  }, [meetings]);

  // Optional helper: next upcoming meeting label
  const nextUpcomingLabel = useMemo(() => {
    const now = new Date();
    const next = meetings
      .filter((m) => m.status === 'CONFIRMED' && new Date(m.date) > now)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
    return next ? formatDateTime(next.date) : 'None scheduled';
  }, [meetings]);

  return {
    meetings,
    isLoading,
    isError,
    error,
    refresh: refetch,
    userRole,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredMeetings,
    counts,
    totalCompletedHours,
    nextUpcomingLabel,
    handleJoinMeeting,
    handleMessageConsultant,
    getStatusColor,
    cancelBooking: (
      bookingId: string,
      reason: string,
      shouldRefund: boolean,
      meeting?: Meeting
    ) => cancelMutation.mutate({ bookingId, reason, shouldRefund, meeting }),
    approveBooking: (bookingId: string) => approveMutation.mutate(bookingId),
    rescheduleBooking: (bookingId: string, data: RescheduleBookingRequest) =>
      rescheduleMutation.mutate({ bookingId, data }),
    isProcessing:
      cancelMutation.isPending ||
      approveMutation.isPending ||
      rescheduleMutation.isPending,
  };
}
