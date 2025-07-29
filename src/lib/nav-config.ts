"use client";

import {
	Home,
	MessageCircle,
	Calendar,
	User,
	FileText,
	Settings,
	Users,
	Bot,
	History,
	Zap,
	Hand,
} from "lucide-react";
import type { NavItem } from "@/types/nav";
import { ROUTES } from "@/constants/routes";

export const teacherNav: NavItem[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: Home,
		href: ROUTES.TEACHER.DASHBOARD,
	},
	{
		id: "chat",
		label: "Chat",
		icon: MessageCircle,
		href: ROUTES.TEACHER.CHAT,
		badge: 5,
	},
	{
		id: "meetings",
		label: "Meetings",
		icon: Calendar,
		href: ROUTES.TEACHER.MEETINGS,
	},
	{
		id: "settings",
		label: "Settings",
		icon: User,
		href: ROUTES.TEACHER.SETTINGS,
	},
];

export const studentNav: NavItem[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: Home,
		href: ROUTES.STUDENT.DASHBOARD,
	},
	{
		id: "teachers",
		label: "Find Teachers",
		icon: Users,
		href: ROUTES.STUDENT.TEACHERS,
	},
	{
		id: "ai-agents",
		label: "AI Agents",
		icon: Bot,
		subItems: [
			{
				id: "ai-tutor",
				label: "AI Tutor",
				icon: Zap,
				href: ROUTES.STUDENT.AI_TUTOR,
			},
			{
				id: "ai-chirologist",
				label: "AI Chirologist",
				icon: Hand,
				href: ROUTES.STUDENT.AI_CHIROLOGIST,
			},
		],
	},
	{
		id: "history",
		label: "History",
		icon: History,
		href: ROUTES.STUDENT.HISTORY,
	},
	{
		id: "chat",
		label: "Chat",
		icon: MessageCircle,
		href: ROUTES.STUDENT.CHAT,
		// badge: 3,
	},
	{
		id: "meetings",
		label: "Meetings",
		icon: Calendar,
		href: ROUTES.STUDENT.MEETINGS,
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings,
		href: ROUTES.STUDENT.SETTINGS,
	},
];
