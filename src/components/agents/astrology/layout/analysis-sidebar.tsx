'use client';

import React from 'react';
import { LEFT_MENU_ITEMS } from '@/constants/astrology';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnalysisSidebarProps {
  activeAnalysis: string | null;
  onSelect: (id: string) => void;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
  className?: string;
  readOnly?: boolean;
}

const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({
  activeAnalysis,
  onSelect,
  iconMap,
  className,
  readOnly,
}) => {
  const { activeRole } = useAuth();

  // If a student is viewing their own profile, limit to the first 8 basic analysis items
  const isStudentOwnProfile = activeRole === 'STUDENT' && !readOnly;
  const displayItems = isStudentOwnProfile
    ? LEFT_MENU_ITEMS.slice(0, 8)
    : LEFT_MENU_ITEMS;

  return (
    <aside className={cn('flex h-full flex-col gap-6 p-6', className)}>
      <ScrollArea className="-mr-4 flex-1 pr-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="mb-3 ml-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Analysis & Strength
            </p>
            <div className="grid gap-3">
              {displayItems.map((item) => {
                const Icon = iconMap[item.icon] || Info;
                const isActive = activeAnalysis === item.id;
                return (
                  <Card
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'group cursor-pointer gap-0 overflow-hidden border-slate-200/60 bg-white/80 py-0 transition-all duration-500 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/5',
                      isActive &&
                        'border-primary-200 bg-primary-50/50 shadow-sm'
                    )}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={cn(
                          'rounded-xl p-2 transition-all duration-500',
                          isActive
                            ? 'bg-primary-50 shadow-inner'
                            : 'bg-slate-50 group-hover:bg-slate-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 transition-colors duration-500',
                            isActive
                              ? 'text-primary-600'
                              : 'text-slate-400 group-hover:text-primary-500'
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium transition-colors',
                          isActive ? 'text-primary-600' : 'text-slate-600'
                        )}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="active-pill-left"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default AnalysisSidebar;
