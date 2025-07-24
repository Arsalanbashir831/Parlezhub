"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardSkeleton() {
	return (
		<div className="space-y-8">
			{/* Welcome Section Skeleton */}
			<div className="space-y-2">
				<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-64 animate-pulse" />
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse" />
			</div>

			{/* Grid Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Stats Cards Skeleton */}
				<div className="lg:col-span-6">
					<Card className="h-full">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
								<div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
								<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-6">
					<Card className="h-full">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
								<div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
								<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Recent Sessions Skeleton */}
				<div className="lg:col-span-6">
					<Card className="h-full">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
								<div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{[...Array(2)].map((_, i) => (
								<div key={i} className="flex items-center gap-3 p-3">
									<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
									</div>
									<div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Upcoming Meetings Skeleton */}
				<div className="lg:col-span-6">
					<Card className="h-full">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
								<div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{[...Array(2)].map((_, i) => (
								<div key={i} className="flex items-center gap-3 p-3">
									<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
