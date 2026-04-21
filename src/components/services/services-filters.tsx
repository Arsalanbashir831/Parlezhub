'use client';

import { Search } from 'lucide-react';

import {
    ServiceFilters as IServiceFilters,
    ServiceStatus,
    ServiceType,
} from '@/types/service';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ServicesFiltersProps {
    filters: IServiceFilters;
    setFilters: (filters: Partial<IServiceFilters>) => void;
    clearFilters: () => void;
}

export function ServicesFilters({
    filters,
    setFilters,
}: ServicesFiltersProps) {
    return (
        <Card className="rounded-2xl border-white/5 bg-white/[0.03] shadow-xl backdrop-blur-md">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-primary-500/60" />
                            <Input
                                placeholder="Search services..."
                                value={filters.searchQuery || ''}
                                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                                className="h-12 rounded-xl border-white/10 bg-white/[0.03] pl-12 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                            />
                        </div>
                    </div>

                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(value) =>
                            setFilters({
                                type: value === 'all' ? undefined : (value as ServiceType),
                            })
                        }
                    >
                        <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-white/[0.03] font-bold text-primary-100 focus:ring-primary-500/30 md:w-48">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent className="border-primary-500/10 bg-background">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="language">Language Consultation</SelectItem>
                            <SelectItem value="astrology">Astrology Reading</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) =>
                            setFilters({
                                status: value === 'all' ? undefined : (value as ServiceStatus),
                            })
                        }
                    >
                        <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-white/[0.03] font-bold text-primary-100 focus:ring-primary-500/30 md:w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="border-primary-500/10 bg-background">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Pause</SelectItem>
                        </SelectContent>
                    </Select>


                </div>
            </CardContent>
        </Card>
    );
}
