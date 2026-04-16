'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function ConsultantDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section Skeleton */}
      <div className="relative h-[240px] w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-10 backdrop-blur-md">
        <div className="space-y-4">
          <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-6 w-1/2 animate-pulse rounded-xl bg-white/5" />
          <div className="mt-8 h-14 w-48 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Stats Cards Skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="lg:col-span-4">
            <Card className="rounded-[2rem] border-white/5 bg-white/[0.03] backdrop-blur-md">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
                  <div className="h-6 w-6 animate-pulse rounded bg-white/5" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                  <div className="h-10 w-16 animate-pulse rounded-xl bg-white/10" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Sessions List Skeleton */}
        <div className="lg:col-span-12">
          <Card className="rounded-[2rem] border-white/5 bg-white/[0.03] backdrop-blur-md">
            <CardContent className="space-y-4 p-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="h-8 w-48 animate-pulse rounded-xl bg-white/10" />
                <div className="h-10 w-24 animate-pulse rounded-xl bg-white/10" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-lg bg-white/5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
