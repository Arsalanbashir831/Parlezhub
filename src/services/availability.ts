import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

export interface ApiAvailabilityItem {
  day_of_week: number; // 0-6 (Monday=0)
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  is_recurring: boolean;
}

export interface WeeklyAvailabilityResponse {
  availability: ApiAvailabilityItem[];
}

export const availabilityService = {
  // Create initial availability (bulk)
  setBulk: async (items: ApiAvailabilityItem[]) => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.SET_AVAILABILITY,
      'POST',
      items as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },

  // Replace existing availability entirely
  replaceAll: async (items: ApiAvailabilityItem[]) => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.UPDATE_AVAILABILITY,
      'PUT',
      items as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },

  // Get teacher weekly availability
  getWeekly: async (teacherId: string): Promise<ApiAvailabilityItem[]> => {
    const response = await apiCaller(
      API_ROUTES.PUBLIC.GET_TEACHER_AVAILABILITY(teacherId),
      'GET',
      undefined,
      {},
      true
    );
    // Normalize various response shapes to a flat array of slots
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.availability)) return data.availability;
    if (
      data &&
      data.weekly_schedule &&
      typeof data.weekly_schedule === 'object'
    ) {
      const items: ApiAvailabilityItem[] = [];
      const schedule = data.weekly_schedule as Record<string, unknown>;
      Object.values(schedule).forEach((value) => {
        const dayObj = value as {
          day_of_week: number;
          slots: {
            start_time: string;
            end_time: string;
          }[];
        };
        const dayIndex =
          typeof dayObj.day_of_week === 'number'
            ? dayObj.day_of_week
            : undefined;
        if (!Array.isArray(dayObj.slots) || dayIndex === undefined) return;
        dayObj.slots.forEach(
          (slot: { start_time: string; end_time: string }) => {
            if (!slot || !slot.start_time || !slot.end_time) return;
            items.push({
              day_of_week: dayIndex,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_recurring: true,
            });
          }
        );
      });
      return items;
    }
    return [];
  },
};

export interface CreateBookingRequest {
  teacher: string; // teacher_id
  gig: number; // service/gig id
  start_time: string; // ISO string with Z
  end_time: string; // ISO string with Z
  duration_hours: number; // Duration in hours (e.g., 1.5)
  notes?: string;
}

export interface BookingResponse {
  id: number;
  student_name: string;
  teacher_name: string;
  duration_hours: string;
  start_time: string;
  end_time: string;
  scheduled_datetime: string;
  status: string;
  payment_status: string;
  zoom_meeting_id?: number | string;
  zoom_join_url?: string;
  zoom_start_url?: string;
  zoom_password?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  cancellation_reason?: string;
  student: string;
  teacher: string;
  gig: number;
}

export interface BookingApprovalResponse {
  message: string;
  booking: BookingResponse;
  zoom_info?: {
    join_url: string;
    meeting_id: string;
    password: string;
  };
}

export interface RescheduleBookingRequest {
  start_time: string; // ISO string with Z
  end_time: string; // ISO string with Z
  reason: string;
}

export interface RescheduleBookingResponse {
  message: string;
  booking: BookingResponse;
  zoom_info?: {
    join_url: string;
    meeting_id: string;
    password: string;
  };
}

export interface RefundBookingRequest {
  payment_id: number;
  reason: string;
  requested_amount_dollars: number;
}

export interface RefundBookingResponse {
  success: boolean;
  message: string;
  refund_id?: string;
  refunded_amount?: number;
}

export const bookingService = {
  schedule: async (payload: CreateBookingRequest): Promise<BookingResponse> => {
    const response = await apiCaller(
      // Using PUBLIC.SCHEDULE_BOOKING per routes file
      // If this should be a TEACHER or BOOKING namespace, adjust accordingly
      API_ROUTES.PUBLIC.SCHEDULE_BOOKING,
      'POST',
      payload as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },
  approve: async (
    bookingId: string | number
  ): Promise<BookingApprovalResponse> => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.APPROVE_BOOKING(bookingId),
      'POST',
      {},
      {},
      true
    );
    return response.data;
  },
  reschedule: async (
    bookingId: string | number,
    data: RescheduleBookingRequest
  ): Promise<RescheduleBookingResponse> => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.RESCHEDULE_BOOKING(bookingId),
      'POST',
      data as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },
  getMy: async (role: 'STUDENT' | 'TEACHER') => {
    const endpoint =
      role === 'TEACHER'
        ? API_ROUTES.TEACHER.GET_ALL_BOOKINGS
        : API_ROUTES.STUDENT.GET_ALL_BOOKINGS;
    const response = await apiCaller(endpoint, 'GET', undefined, {}, true);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },
  cancel: async (bookingId: string | number, reason: string) => {
    const response = await apiCaller(
      API_ROUTES.TEACHER.CANCEL_BOOKING(bookingId),
      'POST',
      { reason } as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },
  refund: async (
    data: RefundBookingRequest,
    userRole: 'STUDENT' | 'TEACHER'
  ): Promise<RefundBookingResponse> => {
    const endpoint =
      userRole === 'TEACHER'
        ? API_ROUTES.TEACHER.REFUND_BOOKING
        : API_ROUTES.STUDENT.REFUND_BOOKING;
    const response = await apiCaller(
      endpoint,
      'POST',
      data as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },
};

// Helpers to map between UI schedule and API
export const availabilityMapper = {
  // Monday=0 ... Sunday=6
  dayToIndex: (day: string): number => {
    const order = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return Math.max(0, order.indexOf(day));
  },
  // HH:mm -> HH:mm:ss
  toSecondsTime: (t: string): string => (t.length === 5 ? `${t}:00` : t),
};
