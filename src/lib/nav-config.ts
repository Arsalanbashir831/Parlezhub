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
		label: "Messages",
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
	{ id: "profile", label: "Profile", icon: User, href: ROUTES.TEACHER.PROFILE },
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
		id: "ai-tutor",
		label: "AI Tutor",
		icon: Bot,
		href: ROUTES.STUDENT.AI_TUTOR,
	},
	{
		id: "history",
		label: "History",
		icon: History,
		href: ROUTES.STUDENT.HISTORY,
	},
	{
		id: "messages",
		label: "Messages",
		icon: MessageCircle,
		href: ROUTES.STUDENT.MESSAGES,
		badge: 3,
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
