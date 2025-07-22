"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader className="p-6">
					<Skeleton className="h-8 w-24" />
				</SidebarHeader>

				<SidebarContent className="p-4">
					<div className="space-y-2">
						{[...Array(4)].map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				</SidebarContent>

				<SidebarFooter className="p-4">
					<div className="flex items-center gap-3 mb-4">
						<Skeleton className="h-10 w-10 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-16" />
						</div>
					</div>
					<Skeleton className="h-10 w-full" />
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Skeleton className="h-6 w-32" />
					<div className="ml-auto">
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				</header>

				<main className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 md:p-6">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
