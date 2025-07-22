import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherMessagesLoading() {
	return (
		<div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
			{/* Conversations List Skeleton */}
			<Card className="w-full lg:w-80 dark:bg-gray-800 dark:border-gray-700">
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-24 mb-4" />
					<Skeleton className="h-10 w-full" />
				</CardHeader>
				<CardContent className="p-0">
					<div className="space-y-1 p-4 pt-0">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="flex items-center gap-3 p-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1 space-y-2">
									<div className="flex items-center justify-between">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-12" />
									</div>
									<div className="flex gap-2">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-4 w-20" />
									</div>
									<Skeleton className="h-3 w-32" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Chat Area Skeleton */}
			<Card className="flex-1 flex flex-col dark:bg-gray-800 dark:border-gray-700">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<div className="flex gap-2">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex-1 p-4">
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div
								key={i}
								className={`flex gap-3 ${
									i % 2 === 0 ? "justify-start" : "justify-end"
								}`}>
								{i % 2 === 0 && (
									<Skeleton className="h-8 w-8 rounded-full mt-1" />
								)}
								<div className="space-y-1">
									<Skeleton className="h-16 w-48 rounded-lg" />
								</div>
								{i % 2 === 1 && (
									<Skeleton className="h-8 w-8 rounded-full mt-1" />
								)}
							</div>
						))}
					</div>
				</CardContent>
				<div className="p-4 border-t">
					<div className="flex gap-2">
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-10 flex-1" />
						<Skeleton className="h-10 w-16" />
					</div>
				</div>
			</Card>
		</div>
	);
}
