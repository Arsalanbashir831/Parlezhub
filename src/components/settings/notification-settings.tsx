'use client';

import React, { memo } from 'react';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface NotificationData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  sessionReminders: boolean;
  weeklyReports: boolean;
  teacherMessages?: boolean; // For students
  studentMessages?: boolean; // For teachers
  marketingEmails: boolean;
}

interface NotificationSettingsProps {
  notificationData: NotificationData;
  onNotificationChange: (data: NotificationData) => void;
  onSave: () => void;
  isLoading: boolean;
  userRole?: 'student' | 'teacher'; // Role-based configuration
}

const NotificationSettings = memo(
  ({
    notificationData,
    onNotificationChange,
    onSave,
    isLoading,
    userRole = 'student',
  }: NotificationSettingsProps) => {
    const handleToggle = (field: keyof NotificationData, checked: boolean) => {
      onNotificationChange({
        ...notificationData,
        [field]: checked,
      });
    };

    // Role-based notification options
    const getNotificationOptions = () => {
      const baseOptions = [
        {
          key: 'emailNotifications' as const,
          label: 'Email Notifications',
          description: 'Receive updates via email',
        },
        {
          key: 'pushNotifications' as const,
          label: 'Push Notifications',
          description: 'Browser notifications',
        },
        {
          key: 'sessionReminders' as const,
          label: 'Session Reminders',
          description: 'Reminders for scheduled sessions',
        },
        {
          key: 'weeklyReports' as const,
          label: 'Weekly Reports',
          description:
            userRole === 'teacher'
              ? 'Teaching performance summaries'
              : 'Progress summaries',
        },
      ];

      // Role-specific message notification
      const messageOption =
        userRole === 'teacher'
          ? {
              key: 'studentMessages' as const,
              label: 'Student Messages',
              description: 'Messages from your students',
            }
          : {
              key: 'teacherMessages' as const,
              label: 'Teacher Messages',
              description: 'Messages from your teachers',
            };

      const marketingOption = {
        key: 'marketingEmails' as const,
        label: 'Marketing Emails',
        description: 'Updates about new features and offers',
      };

      return [...baseOptions, messageOption, marketingOption];
    };

    const notificationOptions = getNotificationOptions();

    return (
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg dark:text-gray-100">
              Notifications
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium dark:text-gray-200">
                  {option.label}
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
              <Switch
                checked={notificationData[option.key]}
                onCheckedChange={(checked) => handleToggle(option.key, checked)}
              />
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              onClick={onSave}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

NotificationSettings.displayName = 'NotificationSettings';

export default NotificationSettings;
export type { NotificationData };
