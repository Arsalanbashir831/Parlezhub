import { User, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ToggleThemeBtn from "../common/toggle-theme-btn";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

type Props = {
	children: React.ReactNode;
};

export default function AiSessionHeader({ children }: Props) {
	return (
		<div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 backdrop-blur-sm w-full text-black dark:text-white">
			<div className="flex items-center justify-between p-6">
				{/* Left side - Back button */}
				<Link href={ROUTES.STUDENT.AI_TUTOR}>
					<Button
						variant="ghost"
						className="text-gray-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to AI Tutor
					</Button>
				</Link>

				{children}

				{/* Right side - User profile and theme toggle */}
				<div className="flex items-center gap-3">
					<ToggleThemeBtn className="hover:bg-black/5" />

					<div className="flex items-center gap-3 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 dark:border-white/20">
						<Avatar className="h-8 w-8">
							<AvatarImage src="/placeholder-avatar.png" />
							<AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
								<User className="h-4 w-4" />
							</AvatarFallback>
						</Avatar>
						<div className="text-sm">
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
