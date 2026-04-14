'use client';

import React from 'react';
import { Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HistoryFiltersProps {
  searchQuery: string;
  selectedLanguage: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onSortChange: (value: string) => void;
  availableLanguages: string[];
}

export const HistoryFilters = React.memo<HistoryFiltersProps>(
  ({
    searchQuery,
    selectedLanguage,
    sortBy,
    onSearchChange,
    onLanguageChange,
    onSortChange,
    availableLanguages,
  }) => {
    return (
      <Card className="rounded-2xl border-white/5 bg-white/[0.03] shadow-xl backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-primary-500/60" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/[0.03] pl-12 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
              />
            </div>

            <Select value={selectedLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-white/[0.03] font-bold text-primary-100 focus:ring-primary-500/30 md:w-48">
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent className="border-primary-500/10 bg-background">
                <SelectItem value="all">All languages</SelectItem>
                {availableLanguages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-white/[0.03] font-bold text-primary-100 focus:ring-primary-500/30 md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-primary-500/10 bg-background">
                <SelectItem value="date">Most Recent</SelectItem>
                <SelectItem value="score">Highest Score</SelectItem>
                <SelectItem value="duration">Longest Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }
);

HistoryFilters.displayName = 'HistoryFilters';
