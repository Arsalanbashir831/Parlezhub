"use client";

import { Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatTime, getProgressPercentage } from "@/lib/ai-session-utils";
import { SESSION_DURATION } from "@/constants/ai-session";

interface SessionTimerProps {
	timeRemaining: number;
}

export default function SessionTimer({ timeRemaining }: SessionTimerProps) {
	return (
		<div className="flex items-center gap-2 md:gap-6">
			{/* Timer */}
			<div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 md:px-4 md:py-2 border dark:border-white/20 border-black/5">
				<Timer className="h-4 w-4 text-orange-400" />
				<span className="font-mono text-sm md:text-lg">
					{formatTime(timeRemaining)}
				</span>
			</div>

			{/* Progress */}
			<div className="w-24 md:w-32">
				<Progress
					value={getProgressPercentage(timeRemaining, SESSION_DURATION)}
					className="h-3 bg-black/5 dark:bg-white/20"
				/>
			</div>
		</div>
	);
}
