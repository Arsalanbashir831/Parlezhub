"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/contexts/session-context";
import { ACCENTS } from "@/constants/ai-session";

export default function TutorSettings() {
	const { config, updateConfig } = useSession();

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">AI Tutor Settings</h2>
				<p className="text-gray-600 dark:text-gray-400">
					Customize your AI tutor's voice and personality
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Gender Selection */}
				<div className="space-y-4">
					<Label className="text-base font-semibold">Voice Gender</Label>
					<RadioGroup
						value={config.gender}
						onValueChange={(value) => updateConfig("gender", value)}
						className="grid grid-cols-3 gap-4">
						{["male", "female", "neutral"].map((gender) => (
							<div key={gender} className="flex items-center space-x-2">
								<RadioGroupItem value={gender} id={gender} />
								<Label htmlFor={gender} className="capitalize cursor-pointer">
									{gender}
								</Label>
							</div>
						))}
					</RadioGroup>
				</div>

				{/* Accent Selection */}
				<div className="space-y-4">
					<Label className="text-base font-semibold">Accent</Label>
					<Select
						value={config.accent}
						onValueChange={(value) => updateConfig("accent", value)}>
						<SelectTrigger>
							<SelectValue placeholder="Select accent" />
						</SelectTrigger>
						<SelectContent>
							{ACCENTS[config.language]?.map((accent) => (
								<SelectItem key={accent} value={accent}>
									{accent}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Context */}
			<div className="space-y-2">
				<Label className="text-base font-semibold">
					Tutor Personality & Context
				</Label>
				<Textarea
					value={config.context}
					onChange={(e) => updateConfig("context", e.target.value)}
					placeholder="Describe how you want your AI tutor to behave..."
					rows={4}
				/>
				<p className="text-sm text-gray-500">
					This helps the AI understand your preferred teaching style
				</p>
			</div>
		</div>
	);
}
