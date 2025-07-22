import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	isCollapsed?: boolean;
}

export function Logo({
	className,
	size = "md",
	isCollapsed = false,
}: LogoProps) {
	const sizeClasses = {
		sm: "text-xl",
		md: "text-2xl",
		lg: "text-3xl",
	};

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div className="relative">
				<div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
					<span className="text-white font-bold text-sm">L</span>
				</div>
				<div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-400 rounded-full animate-pulse"></div>
			</div>
			{!isCollapsed && (
				<span
					className={cn(
						"font-bold text-gray-900 dark:text-gray-100",
						sizeClasses[size]
					)}>
					Linkgua<span className="text-primary-500">Flex</span>
				</span>
			)}
		</div>
	);
}
