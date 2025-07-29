import { User, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import ToggleThemeBtn from "../common/toggle-theme-btn";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

type Props = {
	children: React.ReactNode;
	backButtonText?: string;
	backButtonHref?: string;
	showBackButton?: boolean;
};

export default function AiSessionHeader({
	children,
	backButtonText = "Back to AI Tutor",
	backButtonHref = ROUTES.STUDENT.AI_TUTOR,
	showBackButton = true,
}: Props) {
	return (
		<div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 backdrop-blur-sm w-full text-black dark:text-white">
			<div className="flex items-center justify-between p-3 sm:p-4 lg:p-6">
				{/* Left side - Back button */}
				{showBackButton && (
					<Link href={backButtonHref}>
						<Button
							variant="ghost"
							size="sm"
							className="text-gray-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 flex-shrink-0">
							<ArrowLeft className="h-4 w-4 sm:mr-2 text-gray-700 hover:text-black dark:text-white" />
							<span className="hidden sm:inline">{backButtonText}</span>
						</Button>
					</Link>
				)}

				{/* Center content - responsive container */}
				<div className="flex-1 sm:px-4 flex justify-center">{children}</div>

				{/* Right side - User profile and theme toggle */}
				<div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
					{/* <ToggleThemeBtn className="hover:bg-black/5 h-8 w-8 sm:h-10 sm:w-10" /> */}

					<div className="flex items-center gap-2 sm:gap-3 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2 border border-gray-200 dark:border-white/20">
						<Avatar className="h-6 w-6 sm:h-8 sm:w-8">
							<AvatarImage src="/placeholder-avatar.png" />
							<AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
								<User className="h-3 w-3 sm:h-4 sm:w-4" />
							</AvatarFallback>
						</Avatar>
						<div className="text-xs sm:text-sm hidden sm:block">
							<p className="text-gray-900 dark:text-white font-medium">
								John Doe
							</p>
							<p className="text-gray-600 dark:text-gray-300 text-xs">
								Student
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
