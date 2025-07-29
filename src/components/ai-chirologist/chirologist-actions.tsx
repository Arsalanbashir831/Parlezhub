"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChirologistActionsProps {
	onStartSession: () => void;
}

export default function ChirologistActions({
	onStartSession,
}: ChirologistActionsProps) {
	return (
		<div className="flex items-center justify-center">
			<Button onClick={onStartSession} size="lg" className="gap-2">
				<Play className="h-4 w-4" />
				Start Session
			</Button>
		</div>
	);
} 