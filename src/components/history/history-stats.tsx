'use client';

import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface HistoryStatsProps {
  totalConversations: number;
  totalMinutes: number;
  totalWords: number;
}

export const HistoryStats = React.memo<HistoryStatsProps>(
  ({ totalConversations, totalMinutes, totalWords }) => {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Conversations Card */}
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]">
          <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl" />
          <CardContent className="relative p-7">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500/80">
                  Total Conversations
                </p>
                <h2 className="text-4xl font-semibold tracking-tighter text-white">
                  {totalConversations}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Practice Time Card */}
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]">
          <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl" />
          <CardContent className="relative p-7">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500/80">
                  Total Practice Time
                </p>
                <h2 className="text-4xl font-semibold tracking-tighter text-white">
                  {totalMinutes}m
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Words Spoken Card */}
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]">
          <div className="absolute -right-4 -top-12 h-24 w-24 rounded-full bg-primary-500/10 blur-3xl" />
          <CardContent className="relative p-7">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500/80">
                  Words Spoken
                </p>
                <h2 className="text-4xl font-semibold tracking-tighter text-white">
                  {totalWords.toLocaleString()}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

HistoryStats.displayName = 'HistoryStats';
