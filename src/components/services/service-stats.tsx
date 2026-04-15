'use client';

import React from 'react';
import { Briefcase, DollarSign, Star, TrendingUp, Users } from 'lucide-react';

import { ServiceStats } from '@/types/service';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceStatsProps {
  stats: ServiceStats;
}

export default function ServiceStatsComponent({ stats }: ServiceStatsProps) {
  const statCards = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      icon: Briefcase,
      color: 'border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500',
      gradient:
        'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]',
      border: 'border-primary-500/20',
      textColor: 'text-primary-500/80',
      valueColor: 'text-white',
      subColor: 'text-slate-500',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: TrendingUp,
      color: 'border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500',
      gradient:
        'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]',
      border: 'border-primary-500/20',
      textColor: 'text-primary-500/80',
      valueColor: 'text-white',
      subColor: 'text-slate-500'
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: Users,
      color: 'border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500',
      gradient:
        'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]',
      border: 'border-primary-500/20',
      textColor: 'text-primary-500/80',
      valueColor: 'text-white',
      subColor: 'text-slate-500'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500',
      gradient:
        'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]',
      border: 'border-primary-500/20',
      textColor: 'text-primary-500/80',
      valueColor: 'text-white',
      subColor: 'text-slate-500'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
      icon: Star,
      color: 'border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500',
      gradient:
        'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]',
      border: 'border-primary-500/20',
      textColor: 'text-primary-500/80',
      valueColor: 'text-white',
      subColor: 'text-slate-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`h-full bg-gradient-to-br ${stat.gradient} ${stat.border}`}
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className={`p-3 ${stat.color} rounded-xl`}>
                  <Icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-5 w-5 text-primary-500/80" />
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-medium ${stat.textColor}`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold ${stat.valueColor}`}>
                  {stat.value}
                </p>
                {stat.title === 'Average Rating' && stats.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                    <span className={`text-xs ${stat.subColor}`}>
                      Based on reviews
                    </span>
                  </div>
                )}
                {stat.title === 'Total Earnings' && (
                  <p className={`text-xs ${stat.subColor}`}>This month</p>
                )}
                {stat.title === 'Active Services' && (
                  <p className={`text-xs ${stat.subColor}`}>Currently live</p>
                )}
                {stat.title === 'Total Sessions' && (
                  <p className={`text-xs ${stat.subColor}`}>Completed</p>
                )}
                {stat.title === 'Total Services' && (
                  <p className={`text-xs ${stat.subColor}`}>Created</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
