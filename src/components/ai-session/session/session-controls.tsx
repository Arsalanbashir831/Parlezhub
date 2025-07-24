"use client";

import { Pause, Play, Square, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionState } from "@/types/ai-session";

interface SessionControlsProps {
	sessionState: SessionState;
	isMuted: boolean;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	onToggleMute: () => void;
}

export default function SessionControls({
	sessionState,
	isMuted,
	onStart,
	onPause,
	onResume,
	onStop,
	onToggleMute,
}: SessionControlsProps) {
	const renderMainControls = () => {
		switch (sessionState) {
			case "idle":
				return (
					<Button
						onClick={onStart}
						size="lg"
						className="bg-gradient-to-r from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white px-10 py-5 rounded-full shadow-lg shadow-orange-500/30 border border-white/20 backdrop-blur-sm">
						<Play className="h-7 w-7 mr-3" />
						Start Conversation
					</Button>
				);

			case "active":
				return (
					<>
						<Button
							onClick={onPause}
							variant="secondary"
							size="lg"
							className="rounded-full px-6 py-4 bg-orange-600/20 dark:bg-orange-600/30 text-orange-500 dark:text-orange-300 hover:bg-orange-600/30 dark:hover:bg-orange-600/40 border-orange-500/50 shadow-lg shadow-orange-500/25 hover:text-orange-600">
							<Pause className="h-7 w-7" />
						</Button>
						<Button
							onClick={onStop}
							variant="destructive"
							size="lg"
							className="bg-black/60 hover:bg-black/70 text-white rounded-full shadow-2xl shadow-black/30 border border-white/20 backdrop-blur-sm px-6 py-4">
							<Square className="h-7 w-7" />
						</Button>
					</>
				);

			case "paused":
				return (
					<>
						<Button
							onClick={onResume}
							size="lg"
							className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-10 py-5 rounded-full shadow-2xl shadow-orange-500/30 border border-white/20 backdrop-blur-sm">
							<Play className="h-7 w-7 mr-3" />
							Resume
						</Button>
						<Button
							onClick={onStop}
							variant="destructive"
							size="lg"
							className="bg-black/60 hover:bg-black/70 text-white rounded-full shadow-2xl shadow-black/30 border border-white/20 backdrop-blur-sm px-6 py-4">
							<Square className="h-7 w-7" />
						</Button>
					</>
				);

			case "completed":
				return (
					<div className="text-center">
						<p className="text-2xl font-bold text-black dark:text-white mb-4">
							Great job! Session completed.
						</p>
						<p className="text-gray-700 dark:text-gray-300 text-lg">
							Redirecting to your session report...
						</p>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="flex items-center gap-8">
			{renderMainControls()}

			{/* Mute button */}
			{sessionState !== "completed" && (
				<Button
					onClick={onToggleMute}
					variant="ghost"
					size="lg"
					className={`rounded-full backdrop-blur-sm border ${
						isMuted
							? "bg-orange-600/20 dark:bg-orange-600/30 text-orange-500 dark:text-orange-300 hover:bg-orange-600/30 dark:hover:bg-orange-600/40 border-orange-500/50 shadow-lg shadow-orange-500/25 hover:text-orange-600"
							: "bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 border-black/5 dark:border-white/20 shadow-lg"
					} px-4 py-4`}>
					{isMuted ? (
						<VolumeX className="h-7 w-7" />
					) : (
						<Volume2 className="h-7 w-7" />
					)}
				</Button>
			)}
		</div>
	);
}
