'use client';

import { Search } from 'lucide-react';

import { useMeetings } from '@/hooks/useMeetings';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MeetingFilters() {
  const { searchQuery, setSearchQuery } = useMeetings();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
