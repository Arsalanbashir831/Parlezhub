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
      API_ROUTES.AVAILABILITY.SET_BULK,
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
      API_ROUTES.AVAILABILITY.REPLACE_ALL,
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
      API_ROUTES.AVAILABILITY.GET_WEEKLY(teacherId),
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
