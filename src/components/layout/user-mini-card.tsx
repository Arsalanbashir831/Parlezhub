"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

interface UserMiniCardProps {
	roleLabel: string;
	collapsed?: boolean;
}

export const UserMiniCard: React.FC<UserMiniCardProps> = ({
	roleLabel,
	collapsed = false,
}) => {
	const { user } = useAuth();

	if (collapsed) {
		return (
			<div className="flex justify-center mb-4">
				<Avatar>
					<AvatarImage src={user?.avatar} />
					<AvatarFallback>
						{user?.firstName?.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3 mb-4">
			<Avatar>
				<AvatarImage src={user?.avatar} />
				<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
					{user?.firstName?.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
					{user?.firstName} {user?.lastName}
				</p>
				<p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
					{roleLabel}
				</p>
			</div>
		</div>
	);
};
