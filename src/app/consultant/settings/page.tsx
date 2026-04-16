'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/user-context';
import {
  availabilityMapper,
  availabilityService,
} from '@/services/availability';

import type { AvailabilitySchedule } from '@/components/settings';
import {
  AccountStatus,
  AvailabilityCalendar,
  ProfileSettings,
  SecuritySettings,
  SettingsHeader,
} from '@/components/settings';

export default function ConsultantSettingsPage() {
  const { user } = useUser();
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [schedule, setSchedule] = useState<AvailabilitySchedule | undefined>(
    undefined
  );

  // Load existing availability
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoadingAvailability(true);
      try {
        const items = await availabilityService.getWeekly(user.id);
        // Map API to UI schedule
        const byIndex: Record<number, { start: string; end: string } | null> =
          {};
        items.forEach((i) => {
          byIndex[i.day_of_week] = {
            start: i.start_time.slice(0, 5),
            end: i.end_time.slice(0, 5),
          };
        });
        const days = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ] as const;
        const mapped: AvailabilitySchedule = days.map((d, idx) => {
          const slot = byIndex[idx] || null;
          return {
            day: d,
            isAvailable: Boolean(slot),
            startTime: slot ? slot.start : '09:00',
            endTime: slot ? slot.end : '17:00',
          };
        });
        setSchedule(mapped);
      } catch (e) {
        // ignore for now, UI defaults will show
      } finally {
        setLoadingAvailability(false);
      }
    };
    load();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <SettingsHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="space-y-8 lg:col-span-2">
          {/* Profile Information */}
          <ProfileSettings userRole="consultant" />

          {/* Availability Calendar */}
          <AvailabilityCalendar
            title="Weekly Availability"
            description="Choose the days and times you are available for sessions."
            value={schedule}
            onChange={setSchedule}
            isSaving={savingAvailability}
            onSave={async (s) => {
              if (!user?.id) return;
              setSavingAvailability(true);
              try {
                const payload = s
                  .filter((d) => d.isAvailable)
                  .map((d) => ({
                    day_of_week: availabilityMapper.dayToIndex(d.day),
                    start_time: availabilityMapper.toSecondsTime(d.startTime),
                    end_time: availabilityMapper.toSecondsTime(d.endTime),
                    is_recurring: true,
                  }));
                // If there is already availability, replace; otherwise set bulk
                if (schedule?.some((d) => d.isAvailable) ?? false) {
                  // await availabilityService.replaceAll(payload);
                  await availabilityService.replaceAll(payload);
                } else {
                  await availabilityService.setBulk(payload);
                }
              } finally {
                setSavingAvailability(false);
              }
            }}
          />

          {/* Security Settings */}
          <SecuritySettings
            securityData={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            onSecurityChange={() => { }}
            onSave={async () => { }}
            isLoading={false}
            showPassword={false}
            onTogglePasswordVisibility={() => { }}
          />
        </div>

        {/* Right Column - Account Status & Notifications */}
        <div className="space-y-8">
          {/* Account Status */}
          <AccountStatus
            memberSince={user?.created_at || ''}
            accountType={(user?.role as 'TEACHER' | 'STUDENT') || 'TEACHER'}
            verificationStatus="verified"
          />

          {/* Notification Settings */}
          {/* <NotificationSettings
            notificationData={{
              emailNotifications: true,
              pushNotifications: true,
              sessionReminders: false,
              weeklyReports: false,
              marketingEmails: false,
              consultantMessages: false,
              studentMessages: false,
            }}
            onNotificationChange={() => {}}
            onSave={async () => {}}
            isLoading={false}
            userRole="consultant"
          /> */}
        </div>
      </div>
    </div>
  );
}
