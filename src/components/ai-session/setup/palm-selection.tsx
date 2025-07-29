"use client";

import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/session-context";
import { PALM_TYPES } from "@/constants/ai-chirologist-session";

export default function PalmSelection() {
	const { config, updateConfig } = useSession();

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Choose Your Palm</h2>
				<p className="text-gray-600 dark:text-gray-400">
					Which hand would you like to have read?
				</p>
			</div>

			<div className="max-w-2xl mx-auto space-y-4">
				<Label className="text-base font-semibold">Palm Selection</Label>
				<div className="space-y-3">
					{PALM_TYPES.map((palm) => (
						<Card
							key={palm.value}
							className={`cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
								config.palmType === palm.value
									? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
									: ""
							}`}
							onClick={() => updateConfig("palmType", palm.value)}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold">{palm.label}</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{palm.description}
										</p>
									</div>
									{config.palmType === palm.value && (
										<Check className="h-5 w-5 text-primary-600" />
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
} 