"use client";

import { SessionConfig } from "@/types/ai-session";

interface SessionInfoProps {
	config: SessionConfig;
}

export default function SessionInfo({ config }: SessionInfoProps) {
	return (
		<div className="text-center mb-12">
			<h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-black dark:text-white capitalize">
				{config.language.charAt(0).toUpperCase() + config.language.slice(1)}{" "}
				Conversation Practice
			</h1>
			<p className="text-sm sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-4 font-medium">
				{config.topic}
			</p>
			<div className="flex items-center justify-center gap-4 text-xs md:text-sm text-gray-400 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
				<span className="capitalize text-orange-500 dark:text-orange-300">
					{config.gender} voice
				</span>
				<span className="text-gray-500">•</span>
				<span className="text-gray-500 dark:text-white">
					{config.accent} accent
				</span>
				<span className="text-gray-500">•</span>
				<span className="capitalize text-green-500 dark:text-green-300">
					{config.level} level
				</span>
			</div>
		</div>
	);
}
