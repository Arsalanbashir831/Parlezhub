import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatTime = (date: Date) => {
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatMessageTime = (timestamp: string) => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInHours = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60)
	);

	if (diffInHours < 1) {
		return "Just now";
	} else if (diffInHours < 24) {
		return `${diffInHours}h ago`;
	} else {
		return date.toLocaleDateString([], { month: "short", day: "numeric" });
	}
};

export const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString([], {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};
