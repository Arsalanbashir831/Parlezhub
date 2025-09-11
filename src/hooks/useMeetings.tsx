'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useUser } from '@/contexts/user-context';
import {
  bookingService,
  RescheduleBookingRequest,
} from '@/services/availability';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { formatDateTime } from '@/lib/utils';

export type MeetingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export interface Meeting {
  id: string;
  teacherName?: string; // Optional for teacher view
  studentName?: string; // For teacher view
  teacherAvatar?: string;
  studentAvatar?: string; // For teacher view
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
}

export function useMeetings() {
  const router = useRouter();

  // Determine if we're in teacher or student context
  const { user } = useUser();
  const queryClient = useQueryClient();

  // UI state
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Load meetings from API
  useQuery<ApiBooking[], Error, Meeting[], [string, string | undefined]>({
    queryKey: ['bookings', user?.role],
    queryFn: async () =>
      bookingService.getMy(user?.role as 'TEACHER' | 'STUDENT'),
    select: (data: ApiBooking[]) => {
      const role = (user?.role || '').toLowerCase();
      const mapped: Meeting[] = (data || []).map((b: ApiBooking) => {
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
          teacherName: b.teacher_name,
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
          meetingLink: role === 'teacher' ? b.zoom_start_url : b.zoom_join_url,
          joinLink: b.zoom_join_url,
          hostLink: b.zoom_start_url,
          notes: b.notes,
        };
      });
      return mapped;
    },
    enabled: Boolean(user?.id && user?.role),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Keep local state in sync with query result via a second query call
  const localQuery = useQuery<
    ApiBooking[],
    Error,
    Meeting[],
    ['bookings-local', string | undefined]
  >({
    queryKey: ['bookings-local', user?.role],
    queryFn: async () =>
      bookingService.getMy(user?.role as 'TEACHER' | 'STUDENT'),
    select: (data: ApiBooking[]) => {
      const role = (user?.role || '').toLowerCase();
      const mapped: Meeting[] = (data || []).map((b: ApiBooking) => ({
        id: String(b.id),
        teacherName: b.teacher_name,
        studentName: b.student_name,
        subject: 'Language Session',
        date: b.start_time,
        endDate: b.end_time || b.finish_time,
        duration:
          b.duration_minutes ??
          (b.end_time
            ? Math.max(
                0,
                Math.round(
                  (new Date(b.end_time).getTime() -
                    new Date(b.start_time).getTime()) /
                    60000
                )
              )
            : 60),
        status: (b.status as MeetingStatus) || 'PENDING',
        paymentStatus:
          (b.payment_status as 'PAID' | 'UNPAID' | 'PENDING') || 'UNPAID',
        language: b.language || 'N/A',
        price: b.price || 0,
        location: 'Online',
        meetingLink: role === 'teacher' ? b.zoom_start_url : b.zoom_join_url,
        joinLink: b.zoom_join_url,
        hostLink: b.zoom_start_url,
        notes: b.notes,
      }));
      return mapped;
    },
    enabled: Boolean(user?.id && user?.role),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Sync local state from the localQuery result whenever it changes
  useEffect(() => {
    if (localQuery.data) {
      setMeetings(localQuery.data);
    }
  }, [localQuery.data]);

  const cancelMutation = useMutation({
    mutationFn: async ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason: string;
    }) => bookingService.cancel(bookingId, reason),
    onSuccess: async () => {
      toast.success('Booking cancelled');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings-local'] }),
      ]);
    },
    onError: () => toast.error('Failed to cancel booking'),
  });
  const approveMutation = useMutation({
    mutationFn: async (bookingId: string) => bookingService.approve(bookingId),
    onSuccess: async () => {
      toast.success('Booking approved');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings-local'] }),
      ]);
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings-local'] }),
      ]);
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

  const handleMessageTeacher = useCallback(
    (personId: string) => {
      if (user?.role === 'TEACHER') {
        // Teacher messaging a student
        router.push(ROUTES.TEACHER.CHAT + '?student=' + personId);
      } else {
        // Student messaging a teacher
        router.push(ROUTES.STUDENT.CHAT + '?teacher=' + personId);
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
      // Search matches both teacher and student names
      const matchesSearch =
        m.teacherName?.toLowerCase().includes(q) ||
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
    setMeetings,
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
    handleMessageTeacher,
    getStatusColor,
    cancelBooking: (bookingId: string, reason: string) =>
      cancelMutation.mutate({ bookingId, reason }),
    approveBooking: (bookingId: string) => approveMutation.mutate(bookingId),
    rescheduleBooking: (bookingId: string, data: RescheduleBookingRequest) =>
      rescheduleMutation.mutate({ bookingId, data }),
  };
}
