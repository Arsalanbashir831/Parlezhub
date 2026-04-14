'use client';

import React from 'react';
import { Filter, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface TeacherFiltersProps {
  searchQuery: string;
  selectedLanguage: string;
  priceRange: number[];
  showFilters: boolean;
  resultsCount: number;
  availableLanguages: string[];
  onSearchChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onPriceRangeChange: (value: number[]) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export const TeacherFilters = React.memo<TeacherFiltersProps>(
  ({
    searchQuery,
    selectedLanguage,
    priceRange,
    showFilters,
    resultsCount,
    availableLanguages,
    onSearchChange,
    onLanguageChange,
    onPriceRangeChange,
    onToggleFilters,
    onClearFilters,
  }) => {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search by name, language, or specialty..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                onClick={onToggleFilters}
                className="w-fit gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <p className="text-sm text-primary-100">
                {resultsCount} teachers found
              </p>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={onLanguageChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {availableLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Price Range ($/hour)</Label>
                  <div className="mt-3">
                    <Slider
                      value={priceRange}
                      onValueChange={onPriceRangeChange}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="mt-1 flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

TeacherFilters.displayName = 'TeacherFilters';
