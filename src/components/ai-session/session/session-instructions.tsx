"use client";

import { Volume2, Timer } from "lucide-react";

export default function SessionInstructions() {
	return (
		<div className="mt-16 text-center max-w-4xl">
			<h3 className="text-xl font-bold mb-6 text-black dark:text-white">
				How it works:
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
				<div className="flex flex-col items-center p-6 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-black/10 dark:border-white/20">
					<div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
						<Volume2 className="h-8 w-8 text-white" />
					</div>
					<p className="text-gray-800 dark:text-gray-200 font-medium">
						Speak naturally - the AI listens continuously
					</p>
				</div>
				<div className="flex flex-col items-center p-6 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-black/10 dark:border-white/20">
					<div className="w-16 h-16 bg-gradient-to-r from-white to-gray-300 dark:to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-white/30">
						<div className="w-8 h-8 bg-orange-500 rounded-full" />
					</div>
					<p className="text-gray-800 dark:text-gray-200 font-medium">
						No turn-taking - conversation flows like with humans
					</p>
				</div>
				<div className="flex flex-col items-center p-6 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
					<div className="w-16 h-16 bg-gradient-to-r from-black to-gray-800 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-black/50">
						<Timer className="h-8 w-8 text-white" />
					</div>
					<p className="text-gray-800 dark:text-gray-200 font-medium">
						5-minute session with real-time feedback
					</p>
				</div>
			</div>
		</div>
	);
}
