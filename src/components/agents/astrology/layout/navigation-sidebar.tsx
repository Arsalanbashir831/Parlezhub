'use client';

import React from 'react';
import { RIGHT_MENU_ITEMS } from '@/constants/astrology';
import { Info } from 'lucide-react';

import { TransitPlanet } from '@/types/astrology';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import TransitCard from '../components/transit-card';

interface NavigationSidebarProps {
  activeAnalysis: string | null;
  onSelect: (id: string) => void;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
  className?: string;
  transits?: TransitPlanet[];
  readOnly?: boolean;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeAnalysis,
  onSelect,
  iconMap,
  className,
  transits,
  readOnly,
}) => {
  const menuItems = readOnly
    ? RIGHT_MENU_ITEMS.filter((item) => item.id !== 'share-access')
    : RIGHT_MENU_ITEMS;
  return (
    <aside className={cn('flex h-full flex-col gap-6 p-6', className)}>
      <ScrollArea className="-ml-4 flex-1 pl-4">
        <div className="space-y-4">
          <p className="mb-3 mr-1 px-2 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Main Navigation
          </p>

          <div className="grid gap-3">
            {menuItems.map((item) => {
              const Icon = iconMap[item.icon] || Info;
              const isActive = activeAnalysis === item.id;
              return (
                <Card
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    'group cursor-pointer gap-0 overflow-hidden border-slate-200/60 bg-white/80 py-0 transition-all duration-500 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/5',
                    isActive && 'border-primary-200 bg-primary-50/50 shadow-sm'
                  )}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={cn(
                        'rounded-xl p-2.5 transition-all duration-500',
                        isActive
                          ? 'scale-110 bg-primary-100 shadow-sm'
                          : 'bg-slate-50 group-hover:scale-105'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          isActive
                            ? 'text-primary-600'
                            : 'text-slate-400 group-hover:text-primary-500'
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-semibold tracking-tight',
                        isActive
                          ? 'text-slate-900'
                          : 'text-slate-500 group-hover:text-slate-900'
                      )}
                    >
                      {readOnly && item.id === 'birth-profile'
                        ? 'Birth Profile'
                        : item.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Transit Card Section */}
          <TransitCard
            className="mt-4"
            transits={transits?.map((t) => ({
              planet: t.planet,
              sign: t.sign,
              retrograde: t.speed_per_day < 0,
            }))}
          />
        </div>
      </ScrollArea>
    </aside>
  );
};

export default NavigationSidebar;
