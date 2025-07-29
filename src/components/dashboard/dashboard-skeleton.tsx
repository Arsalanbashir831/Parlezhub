'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Stats Cards Skeleton */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions Skeleton */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Meetings Skeleton */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
