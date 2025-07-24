"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/contexts/session-context";
import { LANGUAGES } from "@/constants/ai-session";

export default function LanguageSelection() {
	const { config, updateConfig } = useSession();

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Choose Your Language</h2>
				<p className="text-gray-600 dark:text-gray-400">
					Which language would you like to practice today?
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{LANGUAGES.map((language) => (
					<Card
						key={language.value}
						className={`cursor-pointer transition-all hover:shadow-md ${
							config.language === language.value
								? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
								: ""
						}`}
						onClick={() => updateConfig("language", language.value)}>
						<CardContent className="p-6 text-center">
							<div className="text-4xl mb-2">{language.flag}</div>
							<h3 className="font-semibold">{language.label}</h3>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
