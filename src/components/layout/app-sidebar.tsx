"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import type { NavItem } from "@/types/nav";
import { cn } from "@/lib/utils";
import { UserMiniCard } from "./user-mini-card";

interface AppSidebarProps {
	nav: NavItem[];
	activeTab: string;
	roleLabel: string;
	onLogout: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
	nav,
	activeTab,
	roleLabel,
	onLogout,
}) => {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<Sidebar
			collapsible="icon"
			className="shadow-lg border-none bg-white dark:bg-gray-800">
			<SidebarHeader
				className={cn(
					"border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
					isCollapsed ? "py-4" : "p-4"
				)}>
				<Logo size="sm" isCollapsed={isCollapsed} />
			</SidebarHeader>

			<SidebarContent
				className={cn(
					"border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
					!isCollapsed ? "px-2" : ""
				)}>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{nav.map((item) => {
								const isActive = activeTab === item.id;
								return (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={isCollapsed ? item.label : undefined}
											// if isActive, add active class
											className={cn(
												"hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-600 hover:text-white py-6 px-4",
												isActive &&
													"bg-gradient-to-br from-primary-500 to-primary-600 text-white"
											)}>
											<Link
												href={item.href}
												className={cn(isCollapsed && "justify-center")}>
												<item.icon className="shrink-0" />
												{!isCollapsed && <span>{item.label}</span>}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-4 bg-white dark:bg-gray-800">
				<UserMiniCard roleLabel={roleLabel} collapsed={isCollapsed} />
				<Button
					variant="ghost"
					className={cn(
						"w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20",
						isCollapsed && "justify-center"
					)}
					onClick={onLogout}>
					<LogOut className="h-4 w-4" />
					{!isCollapsed && "Sign Out"}
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
};
