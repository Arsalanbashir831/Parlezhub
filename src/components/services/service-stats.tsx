"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Star, Users, Briefcase } from "lucide-react";
import { ServiceStats } from "@/types/service";

interface ServiceStatsProps {
	stats: ServiceStats;
}

export default function ServiceStatsComponent({ stats }: ServiceStatsProps) {
	const statCards = [
		{
			title: "Total Services",
			value: stats.totalServices,
			icon: Briefcase,
			color: "bg-blue-500",
			gradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
			border: "border-blue-200 dark:border-blue-800",
			textColor: "text-blue-700 dark:text-blue-300",
			valueColor: "text-blue-900 dark:text-blue-100",
			subColor: "text-blue-600 dark:text-blue-400"
		},
		{
			title: "Active Services",
			value: stats.activeServices,
			icon: TrendingUp,
			color: "bg-green-500",
			gradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
			border: "border-green-200 dark:border-green-800",
			textColor: "text-green-700 dark:text-green-300",
			valueColor: "text-green-900 dark:text-green-100",
			subColor: "text-green-600 dark:text-green-400"
		},
		{
			title: "Total Sessions",
			value: stats.totalSessions,
			icon: Users,
			color: "bg-purple-500",
			gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
			border: "border-purple-200 dark:border-purple-800",
			textColor: "text-purple-700 dark:text-purple-300",
			valueColor: "text-purple-900 dark:text-purple-100",
			subColor: "text-purple-600 dark:text-purple-400"
		},
		{
			title: "Total Earnings",
			value: `$${stats.totalEarnings.toLocaleString()}`,
			icon: DollarSign,
			color: "bg-yellow-500",
			gradient: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
			border: "border-yellow-200 dark:border-yellow-800",
			textColor: "text-yellow-700 dark:text-yellow-300",
			valueColor: "text-yellow-900 dark:text-yellow-100",
			subColor: "text-yellow-600 dark:text-yellow-400"
		},
		{
			title: "Average Rating",
			value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
			icon: Star,
			color: "bg-orange-500",
			gradient: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
			border: "border-orange-200 dark:border-orange-800",
			textColor: "text-orange-700 dark:text-orange-300",
			valueColor: "text-orange-900 dark:text-orange-100",
			subColor: "text-orange-600 dark:text-orange-400"
		}
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
			{statCards.map((stat, index) => {
				const Icon = stat.icon;
				return (
					<Card key={index} className={`h-full bg-gradient-to-br ${stat.gradient} ${stat.border}`}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className={`p-3 ${stat.color} rounded-xl`}>
									<Icon className="h-6 w-6 text-white" />
								</div>
								<TrendingUp className={`h-5 w-5 ${stat.subColor}`} />
							</div>
							<div className="space-y-1">
								<p className={`text-sm font-medium ${stat.textColor}`}>
									{stat.title}
								</p>
								<p className={`text-3xl font-bold ${stat.valueColor}`}>
									{stat.value}
								</p>
								{stat.title === "Average Rating" && stats.averageRating > 0 && (
									<div className="flex items-center gap-1">
										<Star className="h-3 w-3 fill-current text-yellow-400" />
										<span className={`text-xs ${stat.subColor}`}>
											Based on reviews
										</span>
									</div>
								)}
								{stat.title === "Total Earnings" && (
									<p className={`text-xs ${stat.subColor}`}>
										This month
									</p>
								)}
								{stat.title === "Active Services" && (
									<p className={`text-xs ${stat.subColor}`}>
										Currently live
									</p>
								)}
								{stat.title === "Total Sessions" && (
									<p className={`text-xs ${stat.subColor}`}>
										Completed
									</p>
								)}
								{stat.title === "Total Services" && (
									<p className={`text-xs ${stat.subColor}`}>
										Created
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
} 