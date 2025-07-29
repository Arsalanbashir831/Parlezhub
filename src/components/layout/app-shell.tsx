"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
// import ToggleThemeBtn from "@/components/common/toggle-theme-btn";
import { AppSidebar } from "./app-sidebar";
import type { NavItem } from "@/types/nav";

interface AppShellProps {
	children: React.ReactNode;
	nav: NavItem[];
	roleLabel?: string; // e.g., "Teacher" | "Student"
}

export const AppShell: React.FC<AppShellProps> = ({
	children,
	nav,
	roleLabel = "User",
}) => {
	const pathname = usePathname();
	const { user, logout } = useAuth();
	const router = useRouter();

	const activeTab = React.useMemo(() => {
		const pathSegment = pathname.split("/")[2] || "dashboard";
		
		// Check if the current path matches any direct nav item
		const directMatch = nav.find(item => item.id === pathSegment);
		if (directMatch) {
			return pathSegment;
		}

		// Check if the current path matches any sub-item
		for (const navItem of nav) {
			if (navItem.subItems) {
				const subItemMatch = navItem.subItems.find(subItem => subItem.id === pathSegment);
				if (subItemMatch) {
					return pathSegment; // Return the sub-item id as active
				}
			}
		}

		return pathSegment;
	}, [pathname, nav]);

	const pageTitle = React.useMemo(() => {
		// First check sub-items for a more specific title
		for (const navItem of nav) {
			if (navItem.subItems) {
				const subItem = navItem.subItems.find(sub => sub.id === activeTab);
				if (subItem) {
					return subItem.label;
				}
			}
		}

		// Fall back to main nav item or formatted path segment
		const mainNavItem = nav.find(item => item.id === activeTab);
		return mainNavItem?.label || activeTab.replace(/-/g, " ");
	}, [activeTab, nav]);

	const handleLogout = React.useCallback(() => {
		logout();
		router.push("/login");
	}, [logout, router]);

	return (
		<SidebarProvider>
			<AppSidebar
				nav={nav}
				activeTab={activeTab}
				roleLabel={roleLabel}
				onLogout={handleLogout}
			/>

			<SidebarInset>
				{/* Top bar */}
				<header className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
					<div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
							{pageTitle}
						</h1>
						<div className="ml-auto flex items-center gap-4">
							{/* <ToggleThemeBtn /> */}
							<Avatar className="h-8 w-8">
								<AvatarImage src={user?.avatar} />
								<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-sm">
									{user?.firstName?.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</div>
					</div>
				</header>

				{/* Page content */}
				<main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
					<div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
						{children}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
};
