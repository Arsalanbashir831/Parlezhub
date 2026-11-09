'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useUser } from '@/contexts/user-context';
import {
  emptyWeek,
  fromApi,
  isWeekValid,
  sameWeek,
  toApi,
  type WeekSchedule,
} from '@/lib/availability';
import { getErrorMessage } from '@/lib/error-utils';
import { availabilityService } from '@/services/availability';

/**
 * The signed-in consultant's weekly availability, as an editable draft.
 * Saving replaces the whole week; a consultant with nothing saved yet has no
 * schedule to replace, so that first save creates it instead.
 */
export function useMyAvailability() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const teacherId = user?.id ? String(user.id) : '';

  const query = useQuery({
    queryKey: ['my-availability', teacherId],
    queryFn: async () => fromApi(await availabilityService.getWeekly(teacherId)),
    enabled: Boolean(teacherId),
    staleTime: 60_000,
  });

  const saved = query.data ?? null;
  const [draft, setDraft] = useState<WeekSchedule>(emptyWeek);

  // Start editing from what is saved, and again after a save or refetch.
  useEffect(() => {
    if (saved) setDraft(saved);
  }, [saved]);

  const mutation = useMutation({
    mutationFn: async (week: WeekSchedule) => {
      const items = toApi(week);
      const hadSchedule = (saved ?? []).some((day) => day.length > 0);
      try {
        await availabilityService.replaceAll(items);
      } catch (error) {
        // Nothing to replace yet: create the first schedule.
        if (hadSchedule || items.length === 0) throw error;
        await availabilityService.setBulk(items);
      }
      return week;
    },
    onSuccess: async (week) => {
      queryClient.setQueryData(['my-availability', teacherId], week);
      // The booking dialog reads the same schedule under its own key.
      await queryClient.invalidateQueries({ queryKey: ['weekly-availability', teacherId] });
      toast.success('Availability saved', {
        description: 'Learners can now book you in these hours.',
      });
    },
    onError: (error) => {
      toast.error('Availability not saved', { description: getErrorMessage(error) });
    },
  });

  const isDirty = saved !== null && !sameWeek(draft, saved);

  const save = useCallback(() => {
    if (!isWeekValid(draft)) return;
    mutation.mutate(draft);
  }, [draft, mutation]);

  const discard = useCallback(() => {
    if (saved) setDraft(saved);
  }, [saved]);

  return {
    draft,
    setDraft,
    isLoading: query.isLoading || (!teacherId && !query.error),
    error: query.error ? getErrorMessage(query.error) : null,
    retry: () => void query.refetch(),
    isDirty,
    isSaving: mutation.isPending,
    save,
    discard,
  };
}
