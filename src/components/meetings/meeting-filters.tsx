'use client';

import { Search } from 'lucide-react';

import { useMeetings } from '@/hooks/useMeetings';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MeetingFilters() {
  const { searchQuery, setSearchQuery } = useMeetings();

  return (
    <Card className="rounded-2xl border-white/5 bg-white/[0.03] shadow-xl backdrop-blur-md">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-primary-500/60" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-white/[0.03] pl-12 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
